import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';
import * as kv from './kv_store.tsx';

const app = new Hono();

const MERCHANT_LOGIN = 'adventresurs_space';
const MERCHANT_SECRET_KEY = Deno.env.get('WAYFORPAY_MERCHANT_PASSWORD') || '';

console.log('🔧 WayForPay config:', {
  merchantLogin: MERCHANT_LOGIN,
  secretKeySet: !!MERCHANT_SECRET_KEY,
  secretKeyLength: MERCHANT_SECRET_KEY?.length
});

// Helper to get Supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Helper to verify user from token
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}

// Функція для генерації підпису WayForPay
function generateSignature(fields: (string | number)[]): string {
  const signatureString = fields.join(';');
  console.log('📝 Signature string:', signatureString);
  const signature = createHmac('md5', MERCHANT_SECRET_KEY)
    .update(signatureString)
    .digest('hex');
  console.log('🔐 Generated signature:', signature);
  return signature;
}

// Create payment
app.post('/payment/create', async (c) => {
  try {
    console.log('💳 Creating payment...');
    
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      console.error('❌ Unauthorized');
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
    
    const merchantDomainName = c.req.header('origin') || 'adventresurs.space';
    
    // Генерація підпису для WayForPay - суми в EUR
    const signatureFields = [
      MERCHANT_LOGIN,
      merchantDomainName,
      orderReference,
      orderDate.toString(),
      amount.toString(),
      'EUR', // Валюта євро - WayForPay конвертує в UAH
      tierName,
      '1',
      amount.toString()
    ];

    const merchantSignature = generateSignature(signatureFields);
    
    console.log('📦 Creating payment:', {
      orderReference,
      amount,
      tier,
      merchantAccount: MERCHANT_LOGIN,
      currency: 'EUR (буде конвертовано в UAH по курсу WayForPay)',
      userEmail: user.email // Додаємо для логування
    });
    
    // Зберігаємо інформацію про платіж в KV (без JSON.stringify!)
    // ВАЖЛИВО: використовуємо ТІЛЬКИ user.email з реєстрації
    const paymentInfo = {
      userId: user.id,
      email: user.email, // Завжди емейл з реєстрації
      tier,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      orderReference
    };

    await kv.set(`payment:${orderReference}`, paymentInfo);
    console.log('✅ Payment info saved to KV with user email:', user.email);
    
    // Payment data for WayForPay
    const paymentData = {
      merchantAccount: MERCHANT_LOGIN,
      merchantDomainName,
      orderReference,
      orderDate,
      amount,
      currency: 'EUR', // Валюта євро - WayForPay конвертує в UAH
      productName: [tierName],
      productCount: [1],
      productPrice: [amount],
      clientEmail: user.email, // Завжди емейл з реєстрації користувача
      clientFirstName: user.user_metadata?.name?.split(' ')[0] || 'Учасник',
      clientLastName: user.user_metadata?.name?.split(' ')[1] || '',
      language: 'UA',
      merchantSignature,
      serviceUrl: `https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-dc8cbf1f/payment/callback`,
      returnUrl: `${merchantDomainName}/payment-success?orderReference=${orderReference}`
    };

    console.log('✅ Payment data created successfully');

    return c.json(paymentData);

  } catch (error) {
    console.error('❌ Payment creation error:', error);
    return c.json({ error: `Failed to create payment: ${error.message}` }, 500);
  }
});

// Обробка callback від WayForPay
app.post('/payment/callback', async (c) => {
  try {
    console.log('📨 ========================================');
    console.log('📨 WayForPay callback received');
    console.log('📨 Timestamp:', new Date().toISOString());
    console.log('📨 Headers:', JSON.stringify(c.req.header(), null, 2));
    console.log('📨 ========================================');
    
    const callbackData = await c.req.json();
    console.log('📦 Callback data:', JSON.stringify(callbackData, null, 2));

    const {
      orderReference,
      merchantSignature: receivedSignature,
      transactionStatus,
      amount,
      currency,
      reason,
      reasonCode,
      authCode,
      cardPan,
      phone,
      clientEmail: bankClientEmail // Email від банку - НЕ використовуємо!
    } = callbackData;

    console.log('🔑 Key fields:', {
      orderReference,
      transactionStatus,
      amount,
      receivedSignature: receivedSignature?.substring(0, 20) + '...',
      bankClientEmail: bankClientEmail, // Логуємо для відлагодження
    });

    // Перевірка підпису від WayForPay
    const signatureFields = [
      orderReference,
      transactionStatus,
      amount.toString()
    ];
    
    const expectedSignature = generateSignature(signatureFields);

    if (receivedSignature !== expectedSignature) {
      console.error('❌ Invalid signature from WayForPay');
      console.log('Expected:', expectedSignature);
      console.log('Received:', receivedSignature);
      return c.json({ orderReference, status: 'failure', reason: 'Invalid signature' });
    }

    console.log('✅ Signature verified');

    // Отримання інформації про платіж з KV
    const payment = await kv.get(`payment:${orderReference}`);

    if (!payment) {
      console.error('❌ Payment not found in KV:', orderReference);
      return c.json({ orderReference, status: 'failure', reason: 'Payment not found' });
    }

    console.log('📦 Payment data from KV:', payment);
    console.log('📧 Email stored in payment:', payment.email);
    console.log('🔍 Comparing emails:');
    console.log('  - User email (from registration):', payment.email);
    console.log('  - Bank email (from card):', bankClientEmail);
    console.log('  - ⚠️ ВАЖЛИВО: Ми завжди використовуємо email з реєстрації!');

    const supabase = getSupabaseAdmin();

    // Оновлення статусу платежу
    if (transactionStatus === 'Approved') {
      console.log('✅ ========================================');
      console.log('✅ Payment APPROVED for user:', payment.userId);
      console.log('✅ ========================================');
      
      // Отримуємо поточні дані користувача
      const userData = await kv.get(`user:${payment.userId}`);
      console.log('👤 Current user data:', userData);
      
      if (userData) {
        // Оновлюємо дані користувача в KV
        const updatedUserData = {
          ...userData,
          tier: payment.tier,
          payment_status: 'paid',
          transaction_id: callbackData.transactionId || orderReference,
          payment_date: new Date().toISOString()
        };
        
        console.log('💾 Updating user data in KV:', updatedUserData);
        await kv.set(`user:${payment.userId}`, updatedUserData);
        console.log('✅ User data updated in KV');
        
        // Оновлюємо Supabase auth metadata
        console.log('💾 Updating Supabase auth metadata...');
        await supabase.auth.admin.updateUserById(payment.userId, {
          user_metadata: updatedUserData
        });
        console.log('✅ Supabase auth metadata updated');
      } else {
        console.warn('⚠️ User data not found in KV for user:', payment.userId);
      }
      
      // Оновлення статусу платежу
      const updatedPayment = {
        ...payment,
        status: 'completed',
        transactionStatus,
        completedAt: new Date().toISOString(),
        transactionId: callbackData.transactionId || orderReference,
        authCode,
        cardPan,
        phone
      };
      
      console.log('💾 Updating payment status in KV:', updatedPayment);
      await kv.set(`payment:${orderReference}`, updatedPayment);
      console.log('✅ Payment status updated');

      // Відправка email про успішну оплату (non-blocking)
      const tierNames = { basic: 'Світло', deep: 'Магія', premium: 'Диво' };
      
      const { data: { user: userInfo } } = await supabase.auth.admin.getUserById(payment.userId);
      
      if (userInfo) {
        console.log('📧 Queuing payment success email to:', userInfo.email);
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const baseUrl = supabaseUrl.replace('https://', '').replace('http://', '');
        
        fetch(`https://${baseUrl}/functions/v1/make-server-dc8cbf1f/email/send-payment-success`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.user_metadata?.name || 'Користувач',
            tierName: tierNames[payment.tier as keyof typeof tierNames],
            amount: payment.amount
          })
        }).catch(err => console.error('❌ Failed to send payment success email:', err));
        
        console.log('📧 Payment success email queued');
      }

      console.log('✅ ========================================');
      console.log('✅ Callback processed successfully!');
      console.log('✅ ========================================');

      return c.json({
        orderReference,
        status: 'accept',
        time: Math.floor(Date.now() / 1000)
      });

    } else {
      // Неуспішна оплата
      console.log('❌ ========================================');
      console.log('❌ Payment FAILED for user:', payment.userId, 'Reason:', reason);
      console.log('❌ ========================================');
      
      await kv.set(`payment:${orderReference}`, {
        ...payment,
        status: 'failed',
        transactionStatus,
        reason,
        reasonCode,
        failedAt: new Date().toISOString()
      });

      return c.json({
        orderReference,
        status: 'accept',
        time: Math.floor(Date.now() / 1000)
      });
    }

  } catch (error) {
    console.error('❌ ========================================');
    console.error('❌ Payment callback error:', error);
    console.error('❌ ========================================');
    return c.json({ status: 'failure', reason: 'Server error' }, 500);
  }
});

// Перевірка статусу платежу
app.get('/payment/status/:orderReference', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderReference = c.req.param('orderReference');
    const payment = await kv.get(`payment:${orderReference}`);

    if (!payment) {
      return c.json({ error: 'Payment not found' }, 404);
    }

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

// Примусове оновлення статусу користувача після успішної оплати
app.post('/payment/force-update', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { orderReference } = await c.req.json();
    
    console.log('🔄 ========================================');
    console.log('🔄 Force update requested for order:', orderReference);
    console.log('🔄 User:', user.id, user.email);
    
    const payment = await kv.get(`payment:${orderReference}`);

    if (!payment) {
      console.error('❌ Payment not found:', orderReference);
      return c.json({ error: 'Payment not found' }, 404);
    }

    // Перевірка, що це платіж цього користувача
    if (payment.userId !== user.id) {
      console.error('❌ Unauthorized access attempt:', { userId: user.id, paymentUserId: payment.userId });
      return c.json({ error: 'Unauthorized' }, 403);
    }

    console.log('💾 Current payment status:', payment.status);
    
    // ВАЖЛИВО: Примусово встановлюємо статус на completed
    // бо WayForPay widget вже підтвердив оплату, а callback може не прийти
    console.log('✅ WayForPay widget confirmed payment - force updating to completed...');
    
    const supabase = getSupabaseAdmin();
    
    // Оновлюємо статус платежу на completed
    const updatedPayment = {
      ...payment,
      status: 'completed',
      transactionStatus: 'Approved',
      completedAt: new Date().toISOString(),
      forceUpdated: true // маркер що оновлено примусово
    };
    
    console.log('💾 Updating payment status to completed...');
    await kv.set(`payment:${orderReference}`, updatedPayment);
    console.log('✅ Payment status updated to completed');
    
    // Отримуємо поточні дані користувача
    const userData = await kv.get(`user:${payment.userId}`);
    console.log('👤 Current user data:', userData);
    
    if (userData) {
      // Оновлюємо дані користувача в KV
      const updatedUserData = {
        ...userData,
        tier: payment.tier,
        payment_status: 'paid',
        transaction_id: orderReference,
        payment_date: new Date().toISOString()
      };
      
      console.log('💾 Updating user data in KV:', updatedUserData);
      await kv.set(`user:${payment.userId}`, updatedUserData);
      console.log('✅ User data updated in KV');
      
      // Оновлюємо Supabase auth metadata
      console.log('💾 Updating Supabase auth metadata...');
      await supabase.auth.admin.updateUserById(payment.userId, {
        user_metadata: updatedUserData
      });
      console.log('✅ Supabase auth metadata updated');
      
      // Відправка email про успішну оплату (non-blocking)
      const tierNames = { basic: 'Світло', deep: 'Магія', premium: 'Диво' };
      
      const { data: { user: userInfo } } = await supabase.auth.admin.getUserById(payment.userId);
      
      if (userInfo && !payment.emailSent) {
        console.log('📧 Queuing payment success email to:', userInfo.email);
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const baseUrl = supabaseUrl.replace('https://', '').replace('http://', '');
        
        fetch(`https://${baseUrl}/functions/v1/make-server-dc8cbf1f/email/send-payment-success`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.user_metadata?.name || 'Користувач',
            tierName: tierNames[payment.tier as keyof typeof tierNames],
            amount: payment.amount
          })
        }).catch(err => console.error('❌ Failed to send payment success email:', err));
        
        // Маркуємо що email відправлено
        await kv.set(`payment:${orderReference}`, {
          ...updatedPayment,
          emailSent: true
        });
        
        console.log('📧 Payment success email queued');
      }
      
      console.log('✅ ========================================');
      console.log('✅ User status force-updated successfully');
      console.log('✅ ========================================');
      
      return c.json({ 
        success: true, 
        message: 'User status updated',
        tier: payment.tier,
        payment_status: 'paid'
      });
    } else {
      console.warn('⚠️ User data not found in KV');
      return c.json({ error: 'User data not found' }, 404);
    }

  } catch (error) {
    console.error('❌ Error force-updating payment status:', error);
    return c.json({ error: 'Failed to force-update payment status' }, 500);
  }
});

// Отримання поточного тарифу користувача
app.get('/user/tier', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);

    if (!userData) {
      return c.json({ success: true, tier: null });
    }

    return c.json({ 
      success: true, 
      tier: {
        tier: userData.tier,
        payment_status: userData.payment_status,
        payment_date: userData.payment_date
      }
    });

  } catch (error) {
    console.error('Error fetching user tier:', error);
    return c.json({ error: 'Failed to fetch user tier' }, 500);
  }
});

// Оновлення статусу для конкретних користувачів за email (для адмінів)
app.post('/payment/update-by-email', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Перевірка що це адмін
    if (user.email !== 'katywenka@gmail.com') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { email } = await c.req.json();
    
    console.log('🔍 ========================================');
    console.log('🔍 Updating payments for user:', email);
    
    // Знаходимо користувача за email
    const supabase = getSupabaseAdmin();
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }
    
    const targetUser = users.users.find(u => u.email === email);
    
    if (!targetUser) {
      console.error('❌ User not found:', email);
      return c.json({ error: 'User not found' }, 404);
    }
    
    console.log('👤 Found user:', targetUser.id, targetUser.email);
    
    // Знаходимо всі платежі цього користувача
    const allKeys = await kv.getByPrefix(`payment:`);
    const userPayments = allKeys.filter(p => p.userId === targetUser.id);
    
    console.log('📋 Found payments:', userPayments.length);
    
    const results = [];
    
    for (const payment of userPayments) {
      console.log('🔄 Checking payment:', payment.orderReference, 'status:', payment.status);
      
      // Перевіряємо через WayForPay API
      const requestData = {
        transactionType: 'CHECK_STATUS',
        merchantAccount: MERCHANT_LOGIN,
        orderReference: payment.orderReference,
        apiVersion: 1
      };
      
      const signature = generateSignature([
        requestData.merchantAccount,
        requestData.orderReference
      ]);
      
      const wayforpayRequest = {
        ...requestData,
        merchantSignature: signature
      };
      
      console.log('📤 Sending request to WayForPay for:', payment.orderReference);
      
      try {
        const response = await fetch('https://api.wayforpay.com/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wayforpayRequest)
        });
        
        const wayforpayData = await response.json();
        console.log('📥 WayForPay response:', JSON.stringify(wayforpayData, null, 2));
        console.log('📥 reasonCode:', wayforpayData.reasonCode, 'type:', typeof wayforpayData.reasonCode);
        console.log('📥 transactionStatus:', wayforpayData.transactionStatus);
        console.log('📥 reason:', wayforpayData.reason);
        
        // reasonCode може бути string або number
        const isApproved = wayforpayData.reasonCode == 1100 || 
                           wayforpayData.transactionStatus === 'Approved' ||
                           wayforpayData.reason === 'Ok';
        
        if (isApproved && payment.status !== 'completed') {
          // Оновлюємо статус платежу
          const updatedPayment = {
            ...payment,
            status: 'completed',
            transactionStatus: wayforpayData.transactionStatus || 'Approved',
            transactionId: wayforpayData.transactionId,
            completedAt: new Date().toISOString(),
            updatedFromAPI: true
          };
          
          await kv.set(`payment:${payment.orderReference}`, updatedPayment);
          console.log('✅ Payment updated to completed');
          
          // Оновлюємо користувача
          const userData = await kv.get(`user:${targetUser.id}`);
          const updatedUserData = {
            ...(userData || {}),
            id: targetUser.id,
            email: targetUser.email,
            name: targetUser.user_metadata?.name || userData?.name || 'User',
            tier: payment.tier,
            payment_status: 'paid',
            transaction_id: payment.orderReference,
            payment_date: new Date().toISOString(),
            progress: userData?.progress || []
          };
          
          await kv.set(`user:${targetUser.id}`, updatedUserData);
          
          await supabase.auth.admin.updateUserById(targetUser.id, {
            user_metadata: updatedUserData
          });
          
          console.log('✅ User tier updated to:', payment.tier);
          
          results.push({
            orderReference: payment.orderReference,
            status: 'updated',
            tier: payment.tier
          });
        } else {
          results.push({
            orderReference: payment.orderReference,
            status: payment.status === 'completed' ? 'already_completed' : 'not_approved',
            wayforpayStatus: wayforpayData.transactionStatus
          });
        }
      } catch (error) {
        console.error('❌ Error checking payment:', payment.orderReference, error);
        results.push({
          orderReference: payment.orderReference,
          status: 'error',
          error: error.message
        });
      }
    }
    
    console.log('✅ ========================================');
    console.log('✅ Payment update complete for:', email);
    
    return c.json({
      success: true,
      email,
      userId: targetUser.id,
      results
    });
    
  } catch (error) {
    console.error('❌ Error updating payments by email:', error);
    return c.json({ error: 'Failed to update payments', details: error.message }, 500);
  }
});

// Перевірка статусу оплати через WayForPay API (для адмінів)
app.post('/payment/check-wayforpay-status', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Перевірка що це адмін
    if (user.email !== 'katywenka@gmail.com') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { orderReference } = await c.req.json();
    
    console.log('🔍 ========================================');
    console.log('🔍 Checking payment status with WayForPay for:', orderReference);
    
    // Отримуємо платіж з бази
    const payment = await kv.get(`payment:${orderReference}`);
    
    if (!payment) {
      console.error('❌ Payment not found:', orderReference);
      return c.json({ error: 'Payment not found' }, 404);
    }

    console.log('💾 Current payment in DB:', payment);
    
    // Відправляємо запит до WayForPay API для перевірки статусу
    const requestData = {
      transactionType: 'CHECK_STATUS',
      merchantAccount: MERCHANT_LOGIN,
      orderReference: orderReference,
      apiVersion: 1
    };
    
    // Генеруємо підпис
    const signature = generateSignature([
      requestData.merchantAccount,
      requestData.orderReference
    ]);
    
    const wayforpayRequest = {
      ...requestData,
      merchantSignature: signature
    };
    
    console.log('📤 Sending request to WayForPay:', wayforpayRequest);
    
    const response = await fetch('https://api.wayforpay.com/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wayforpayRequest)
    });
    
    const wayforpayData = await response.json();
    console.log('📥 WayForPay response:', JSON.stringify(wayforpayData, null, 2));
    console.log('📥 reasonCode:', wayforpayData.reasonCode, 'type:', typeof wayforpayData.reasonCode);
    console.log('📥 transactionStatus:', wayforpayData.transactionStatus);
    console.log('📥 reason:', wayforpayData.reason);
    
    // Перевіряємо чи оплата успішна згідно з WayForPay
    // reasonCode може бути string або number
    const isApproved = wayforpayData.reasonCode == 1100 || 
                       wayforpayData.transactionStatus === 'Approved' ||
                       wayforpayData.reason === 'Ok';
    
    console.log('✅ Payment approved by WayForPay:', isApproved);
    
    if (isApproved && payment.status !== 'completed') {
      // Оновлюємо статус платежу
      const updatedPayment = {
        ...payment,
        status: 'completed',
        transactionStatus: wayforpayData.transactionStatus || 'Approved',
        transactionId: wayforpayData.transactionId,
        completedAt: new Date().toISOString(),
        updatedFromAPI: true
      };
      
      console.log('💾 Updating payment status to completed...');
      await kv.set(`payment:${orderReference}`, updatedPayment);
      
      // Оновлюємо користувача
      const userData = await kv.get(`user:${payment.userId}`);
      if (userData) {
        const supabase = getSupabaseAdmin();
        
        const updatedUserData = {
          ...userData,
          tier: payment.tier,
          payment_status: 'paid',
          transaction_id: orderReference,
          payment_date: new Date().toISOString()
        };
        
        console.log('💾 Updating user data...');
        await kv.set(`user:${payment.userId}`, updatedUserData);
        
        await supabase.auth.admin.updateUserById(payment.userId, {
          user_metadata: updatedUserData
        });
        
        console.log('✅ User tier updated to:', payment.tier);
      }
      
      return c.json({
        success: true,
        message: 'Payment status updated from WayForPay',
        wayforpayData,
        updatedPayment
      });
    } else if (payment.status === 'completed') {
      return c.json({
        success: true,
        message: 'Payment already completed',
        wayforpayData,
        payment
      });
    } else {
      return c.json({
        success: false,
        message: 'Payment not approved by WayForPay',
        wayforpayData,
        payment
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking WayForPay status:', error);
    return c.json({ error: 'Failed to check payment status', details: error.message }, 500);
  }
});

// DEMO: Тестовий ендпоінт для симуляції успішної оплати
app.post('/payment/demo-success', async (c) => {
  try {
    console.log('🧪 DEMO: Payment simulation started');
    
    const user = await verifyUser(c.req.header('Authorization'));
    
    if (!user) {
      console.error('DEMO: Unauthorized');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { tier } = body;
    
    console.log('🧪 DEMO: Simulating payment for user', user.id, 'tier:', tier);

    const supabase = getSupabaseAdmin();

    // Оновлення в KV
    const userData = await kv.get(`user:${user.id}`);
    
    const updatedUser = {
      ...(userData || {}),
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || userData?.name || 'User',
      tier: tier,
      payment_status: 'paid',
      transaction_id: `DEMO-${Date.now()}`,
      payment_date: new Date().toISOString(),
      progress: userData?.progress || []
    };
    
    await kv.set(`user:${user.id}`, updatedUser);
    console.log('✅ DEMO: User updated in KV');
    
    // Оновлення Supabase auth metadata
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: updatedUser
    });
    console.log('✅ DEMO: Auth metadata updated');

    // Відправка email про успішну оплату (non-blocking)
    const tierNames = { basic: 'Світло', deep: 'Магія', premium: 'Диво' };
    const tierPrices = { basic: 10, deep: 35, premium: 100 };
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const baseUrl = supabaseUrl.replace('https://', '').replace('http://', '');
    
    fetch(`https://${baseUrl}/functions/v1/make-server-dc8cbf1f/email/send-payment-success`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
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

export default app;