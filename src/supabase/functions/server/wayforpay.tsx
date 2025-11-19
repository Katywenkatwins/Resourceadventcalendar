import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

const app = new Hono();

const MERCHANT_LOGIN = 'adventresurs_space';
const MERCHANT_SECRET_KEY = Deno.env.get('WAYFORPAY_MERCHANT_PASSWORD') || '99a97987a610ae0f7443d490a994e8c9fb211900';

// Функція для генерації підпису WayForPay
function generateSignature(fields: (string | number)[]): string {
  const signatureString = fields.join(';');
  console.log('Signature string:', signatureString);
  const signature = createHmac('md5', MERCHANT_SECRET_KEY)
    .update(signatureString)
    .digest('hex');
  console.log('Generated signature:', signature);
  return signature;
}

// Ініціалізація платежу
app.post('/payment/init', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Перевірка авторизації
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { tier, amount, email } = await c.req.json();

    // Валідація тарифу
    const validTiers = {
      basic: { name: 'Світло', amount: 10 },
      deep: { name: 'Магія', amount: 35 },
      premium: { name: 'Диво', amount: 100 }
    };

    if (!validTiers[tier as keyof typeof validTiers]) {
      return c.json({ error: 'Invalid tier' }, 400);
    }

    const tierInfo = validTiers[tier as keyof typeof validTiers];
    
    if (amount !== tierInfo.amount) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    // Генерація унікального orderReference
    const orderReference = `ADV-${Date.now()}-${user.id.substring(0, 8)}`;
    const orderDate = Math.floor(Date.now() / 1000);

    // Отримання доменного імені (для продакшену використовуйте реальний домен)
    const merchantDomainName = c.req.header('origin') || 'localhost';

    // Формування даних для підпису
    const signatureFields = [
      MERCHANT_LOGIN,
      merchantDomainName,
      orderReference,
      orderDate.toString(),
      amount.toString(),
      'EUR',
      tierInfo.name,
      '1',
      amount.toString()
    ];

    const merchantSignature = generateSignature(signatureFields);

    // Зберігання інформації про платіж у БД
    const { error: kvError } = await supabase
      .from('kv_store_dc8cbf1f')
      .upsert({
        key: `payment:${orderReference}`,
        value: JSON.stringify({
          userId: user.id,
          email: email || user.email,
          tier,
          amount,
          status: 'pending',
          createdAt: new Date().toISOString(),
          orderReference
        })
      });

    if (kvError) {
      console.error('Error saving payment info:', kvError);
      return c.json({ error: 'Failed to save payment info' }, 500);
    }

    // Формування даних для WayForPay
    const paymentData = {
      merchantAccount: MERCHANT_LOGIN,
      merchantDomainName,
      orderReference,
      orderDate,
      amount,
      currency: 'EUR',
      productName: [tierInfo.name],
      productCount: [1],
      productPrice: [amount],
      clientEmail: email || user.email,
      clientFirstName: user.user_metadata?.name || 'Користувач',
      language: 'UA',
      serviceUrl: `https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-dc8cbf1f/payment/callback`,
      returnUrl: `${merchantDomainName}/payment-success?orderReference=${orderReference}`,
      merchantSignature
    };

    console.log('Payment data created:', { orderReference, amount, tier });

    return c.json({ success: true, paymentData });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return c.json({ error: 'Failed to initialize payment' }, 500);
  }
});

// Обробка callback від WayForPay
app.post('/payment/callback', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const callbackData = await c.req.json();
    
    console.log('WayForPay callback received:', callbackData);

    const {
      orderReference,
      merchantSignature: receivedSignature,
      transactionStatus,
      amount,
      currency,
      reason,
      reasonCode
    } = callbackData;

    // Перевірка підпису від WayForPay
    const signatureFields = [
      orderReference,
      transactionStatus,
      amount.toString()
    ];
    
    const expectedSignature = generateSignature(signatureFields);

    if (receivedSignature !== expectedSignature) {
      console.error('Invalid signature from WayForPay');
      return c.json({ orderReference, status: 'failure', reason: 'Invalid signature' });
    }

    // Отримання інформації про платіж з БД
    const { data: paymentData, error: fetchError } = await supabase
      .from('kv_store_dc8cbf1f')
      .select('value')
      .eq('key', `payment:${orderReference}`)
      .single();

    if (fetchError || !paymentData) {
      console.error('Payment not found:', orderReference);
      return c.json({ orderReference, status: 'failure', reason: 'Payment not found' });
    }

    const payment = JSON.parse(paymentData.value);

    // Оновлення статусу платежу
    if (transactionStatus === 'Approved') {
      // Успішна оплата - оновлюємо тариф користувача
      
      // Оновлення в user:userId
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const { data: userData } = await supabase
        .from('kv_store_dc8cbf1f')
        .select('value')
        .eq('key', `user:${payment.userId}`)
        .single();
      
      if (userData) {
        const user = JSON.parse(userData.value);
        await supabase
          .from('kv_store_dc8cbf1f')
          .upsert({
            key: `user:${payment.userId}`,
            value: JSON.stringify({
              ...user,
              tier: payment.tier,
              payment_status: 'paid',
              transaction_id: callbackData.transactionId,
              payment_date: new Date().toISOString()
            })
          });
        
        // Оновлення Supabase auth metadata
        await supabaseAdmin.auth.admin.updateUserById(payment.userId, {
          user_metadata: {
            ...user,
            tier: payment.tier,
            payment_status: 'paid',
            transaction_id: callbackData.transactionId,
            payment_date: new Date().toISOString()
          }
        });
      }
      
      // Зберігання user_tier
      const { error: updateError } = await supabase
        .from('kv_store_dc8cbf1f')
        .upsert({
          key: `user_tier:${payment.userId}`,
          value: JSON.stringify({
            tier: payment.tier,
            purchasedAt: new Date().toISOString(),
            orderReference,
            amount: payment.amount,
            status: 'active'
          })
        });

      if (updateError) {
        console.error('Error updating user tier:', updateError);
      }

      // Оновлення статусу платежу
      await supabase
        .from('kv_store_dc8cbf1f')
        .upsert({
          key: `payment:${orderReference}`,
          value: JSON.stringify({
            ...payment,
            status: 'completed',
            transactionStatus,
            completedAt: new Date().toISOString(),
            transactionId: callbackData.transactionId
          })
        });

      console.log(`Payment approved for user ${payment.userId}, tier: ${payment.tier}`);

      // Відправка email про успішну оплату (non-blocking)
      const tierNames = { basic: 'Світло', deep: 'Магія', premium: 'Диво' };
      
      // Отримати дані користувача для email
      const { data: { user: userInfo } } = await supabaseAdmin.auth.admin.getUserById(payment.userId);
      
      if (userInfo) {
        fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-dc8cbf1f/send-payment-success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.user_metadata?.name || 'Користувач',
            tierName: tierNames[payment.tier as keyof typeof tierNames],
            amount: payment.amount
          })
        }).catch(err => console.error('Failed to send payment success email:', err));
      }

      return c.json({
        orderReference,
        status: 'accept',
        time: Math.floor(Date.now() / 1000)
      });

    } else {
      // Неуспішна оплата
      await supabase
        .from('kv_store_dc8cbf1f')
        .upsert({
          key: `payment:${orderReference}`,
          value: JSON.stringify({
            ...payment,
            status: 'failed',
            transactionStatus,
            reason,
            reasonCode,
            failedAt: new Date().toISOString()
          })
        });

      console.log(`Payment failed for user ${payment.userId}: ${reason}`);

      return c.json({
        orderReference,
        status: 'accept',
        time: Math.floor(Date.now() / 1000)
      });
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    return c.json({ status: 'failure', reason: 'Server error' }, 500);
  }
});

// Перевірка статусу платежу
app.get('/payment/status/:orderReference', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderReference = c.req.param('orderReference');

    const { data: paymentData, error } = await supabase
      .from('kv_store_dc8cbf1f')
      .select('value')
      .eq('key', `payment:${orderReference}`)
      .single();

    if (error || !paymentData) {
      return c.json({ error: 'Payment not found' }, 404);
    }

    const payment = JSON.parse(paymentData.value);

    // Перевірка, що це платіж цього користувача
    if (payment.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ success: true, payment });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    return c.json({ error: 'Failed to fetch payment status' }, 500);
  }
});

// Отримання поточного тарифу користувача
app.get('/user/tier', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: tierData, error } = await supabase
      .from('kv_store_dc8cbf1f')
      .select('value')
      .eq('key', `user_tier:${user.id}`)
      .single();

    if (error || !tierData) {
      return c.json({ success: true, tier: null });
    }

    const tierInfo = JSON.parse(tierData.value);

    return c.json({ success: true, tier: tierInfo });

  } catch (error) {
    console.error('Error fetching user tier:', error);
    return c.json({ error: 'Failed to fetch user tier' }, 500);
  }
});

// DEMO: Тестовий ендпоінт для симуляції успішної оплати (видалити у продакшені)
app.post('/payment/demo-success', async (c) => {
  try {
    console.log('DEMO: /payment/demo-success endpoint called');
    
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    console.log('DEMO: Access token present:', !!accessToken);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    console.log('DEMO: User auth result - user:', user?.id, 'error:', authError?.message);
    
    if (!user?.id || authError) {
      console.error('DEMO: Unauthorized - user:', user, 'error:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { tier } = body;
    console.log('DEMO: Received tier:', tier);

    console.log('DEMO: Simulating payment success for user', user.id, 'tier:', tier);

    // Оновлення в user:userId
    console.log('DEMO: Fetching user data from KV...');
    const { data: userData, error: fetchError } = await supabase
      .from('kv_store_dc8cbf1f')
      .select('value')
      .eq('key', `user:${user.id}`)
      .single();
    
    console.log('DEMO: KV fetch result - userData:', !!userData, 'error:', fetchError?.message);
    
    if (userData) {
      // Parse value if it's a string, otherwise use as-is
      const currentUser = typeof userData.value === 'string' 
        ? JSON.parse(userData.value) 
        : userData.value;
      console.log('DEMO: Current user data:', currentUser);
      
      const updatedUser = {
        ...currentUser,
        tier: tier,
        payment_status: 'paid',
        transaction_id: `DEMO-${Date.now()}`,
        payment_date: new Date().toISOString()
      };
      
      console.log('DEMO: Updating user in KV...');
      const { error: updateError } = await supabase
        .from('kv_store_dc8cbf1f')
        .upsert({
          key: `user:${user.id}`,
          value: JSON.stringify(updatedUser)
        });
      
      if (updateError) {
        console.error('DEMO: Error updating user in KV:', updateError);
      } else {
        console.log('DEMO: User updated in KV successfully');
      }
      
      // Оновлення Supabase auth metadata
      console.log('DEMO: Updating Supabase auth metadata...');
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: updatedUser
      });
      
      if (authUpdateError) {
        console.error('DEMO: Error updating auth metadata:', authUpdateError);
      } else {
        console.log('DEMO: Auth metadata updated successfully');
      }
    } else {
      console.warn('DEMO: User data not found in KV, creating new entry...');
      const newUser = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'User',
        tier: tier,
        payment_status: 'paid',
        transaction_id: `DEMO-${Date.now()}`,
        payment_date: new Date().toISOString(),
        progress: []
      };
      
      await supabase
        .from('kv_store_dc8cbf1f')
        .upsert({
          key: `user:${user.id}`,
          value: JSON.stringify(newUser)
        });
      
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: newUser
      });
    }
    
    // Зберігання user_tier
    console.log('DEMO: Creating user_tier entry...');
    const { error: tierError } = await supabase
      .from('kv_store_dc8cbf1f')
      .upsert({
        key: `user_tier:${user.id}`,
        value: JSON.stringify({
          tier: tier,
          purchasedAt: new Date().toISOString(),
          orderReference: `DEMO-${Date.now()}`,
          amount: tier === 'basic' ? 10 : tier === 'deep' ? 35 : 100,
          status: 'active'
        })
      });

    if (tierError) {
      console.error('DEMO: Error creating user_tier:', tierError);
    } else {
      console.log('DEMO: user_tier created successfully');
    }

    console.log('DEMO: Payment simulation completed successfully for user', user.id);

    // Відправка email про успішну оплату (non-blocking)
    const tierNames = { basic: 'Світло', deep: 'Магія', premium: 'Диво' };
    const tierPrices = { basic: 10, deep: 35, premium: 100 };
    
    fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-dc8cbf1f/send-payment-success`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.user_metadata?.name || 'Користувач',
        tierName: tierNames[tier as keyof typeof tierNames],
        amount: tierPrices[tier as keyof typeof tierPrices]
      })
    }).catch(err => console.error('Failed to send payment success email:', err));

    return c.json({ success: true, message: 'Demo payment successful', tier });

  } catch (error) {
    console.error('DEMO: Payment simulation error:', error);
    return c.json({ error: 'Failed to process demo payment: ' + (error.message || String(error)) }, 500);
  }
});

// Create payment
app.post('/payment/create', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id || error) {
      console.error('Authorization error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { tier, clientEmail } = body;

    const tierPrices = {
      basic: 10,
      deep: 35,
      premium: 100
    };

    const tierNames = {
      basic: 'Світло',
      deep: 'Магія', 
      premium: 'Диво'
    };

    const amount = tierPrices[tier as keyof typeof tierPrices];
    const tierName = tierNames[tier as keyof typeof tierNames];
    
    if (!amount) {
      return c.json({ error: 'Invalid tier' }, 400);
    }

    const orderReference = `advent-${user.id.substring(0, 8)}-${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000);
    
    const merchantDomainName = c.req.header('origin') || 'advent-calendar.com';
    
    // Генерація підпису для WayForPay
    const signatureFields = [
      MERCHANT_LOGIN,
      merchantDomainName,
      orderReference,
      orderDate.toString(),
      amount.toString(),
      'EUR',
      tierName,
      '1',
      amount.toString()
    ];

    const merchantSignature = generateSignature(signatureFields);
    
    console.log('Creating payment:', {
      orderReference,
      amount,
      tier,
      merchantAccount: MERCHANT_LOGIN,
      signature: merchantSignature.substring(0, 10) + '...'
    });
    
    // Зберігаємо інформацію про платіж
    const paymentInfo = {
      userId: user.id,
      email: clientEmail || user.email,
      tier,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      orderReference
    };

    const { error: kvError } = await supabase
      .from('kv_store_dc8cbf1f')
      .upsert({
        key: `payment:${orderReference}`,
        value: paymentInfo,
        updated_at: new Date().toISOString()
      });

    if (kvError) {
      console.error('Error saving payment info:', kvError);
      return c.json({ error: 'Failed to save payment info' }, 500);
    }
    
    // Payment data for WayForPay
    const paymentData = {
      merchantAccount: MERCHANT_LOGIN,
      merchantDomainName,
      orderReference,
      orderDate,
      amount,
      currency: 'EUR',
      productName: [tierName],
      productCount: [1],
      productPrice: [amount],
      clientEmail: clientEmail || user.email,
      clientFirstName: user.user_metadata?.name?.split(' ')[0] || 'Учасник',
      clientLastName: user.user_metadata?.name?.split(' ')[1] || '',
      language: 'UA',
      merchantSignature,
      serviceUrl: `https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-dc8cbf1f/payment/callback`,
      returnUrl: `${merchantDomainName}/payment-success?orderReference=${orderReference}`
    };

    console.log('Payment data created successfully');

    return c.json(paymentData);

  } catch (error) {
    console.error('Payment creation error:', error);
    return c.json({ error: `Failed to create payment: ${error.message}` }, 500);
  }
});

export default app;