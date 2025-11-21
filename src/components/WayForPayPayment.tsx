import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Loader2, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

interface WayForPayPaymentProps {
  tier: 'basic' | 'deep' | 'premium';
  userEmail: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const tierInfo = {
  basic: { name: 'Світло', amount: 10, currency: '€', color: '#2d5a3d' },
  deep: { name: 'Магія', amount: 35, currency: '€', color: '#d94a4a' },
  premium: { name: 'Диво', amount: 100, currency: '€', color: '#e6963a' }
};

export function WayForPayPayment({ tier, userEmail, onSuccess, onCancel }: WayForPayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const currentTier = tierInfo[tier];

  // Function to check payment status
  const checkPaymentStatus = async (orderReference: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('advent_access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/status/${orderReference}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Payment status check:', data);
        
        if (data.payment?.status === 'completed') {
          setPaymentStatus('success');
          return true;
        } else if (data.payment?.status === 'failed') {
          setPaymentStatus('failed');
          setError(data.payment?.reason || 'Оплата не вдалася');
          return false;
        }
      }
      return false;
    } catch (err) {
      console.error('Error checking payment status:', err);
      return false;
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('advent_access_token');
      if (!token) {
        throw new Error('Не авторизовано');
      }

      console.log('💳 Initiating payment for tier:', tier);

      // Get payment data from server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            tier
            // clientEmail видалено - сервер завжди використовує user.email з реєстрації
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Payment creation failed:', errorData);
        throw new Error(errorData.error || 'Помилка створення платежу');
      }

      const paymentData = await response.json();
      console.log('✅ Payment data received:', { 
        orderReference: paymentData.orderReference,
        amount: paymentData.amount,
        currency: paymentData.currency
      });

      // Check if WayForPay widget is loaded
      if (typeof (window as any).Wayforpay === 'undefined') {
        console.log('📦 Loading WayForPay widget script...');
        // Load WayForPay script dynamically
        const script = document.createElement('script');
        script.src = 'https://secure.wayforpay.com/server/pay-widget.js';
        script.id = 'widget-wfp-script';
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
        console.log('✅ WayForPay widget loaded');
      }

      // Create payment widget
      console.log('🚀 Launching WayForPay widget...');
      const wayforpay = new (window as any).Wayforpay();
      
      wayforpay.run({
        ...paymentData,
        straightWidget: false,
      },
      async function onApproved() {
        // Payment approved
        console.log('✅ Payment approved by WayForPay widget');
        setPaymentStatus('processing');
        
        // Wait for server to process callback - збільшуємо час очікування
        console.log('⏳ Waiting for server to process payment...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Збільшено до 5 секунд
        
        // Poll payment status multiple times
        let verified = false;
        for (let attempt = 1; attempt <= 5; attempt++) {
          console.log(`🔍 Attempt ${attempt}/5 to verify payment...`);
          const statusCheck = await checkPaymentStatus(paymentData.orderReference);
          
          if (statusCheck) {
            console.log('✅ Payment verified on server');
            verified = true;
            setPaymentStatus('success');
            setLoading(false);
            break;
          }
          
          // Wait before next attempt
          if (attempt < 5) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        if (!verified) {
          console.warn('⚠️ Payment approved but not verified on server yet');
          console.log('💡 This might be because WayForPay callback has not arrived yet');
          console.log('💡 Please contact support if tier is not activated after 5 minutes');
          
          // Показуємо success, бо WayForPay підтвердив оплату
          // Callback може прийти пізніше і оновить статус
          setPaymentStatus('success');
          setLoading(false);
        }
        
        // Примусово оновлюємо статус користувача після успішної оплати
        console.log('🔄 Force updating user status after payment approval...');
        try {
          const token = localStorage.getItem('advent_access_token');
          const updateResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/force-update`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                orderReference: paymentData.orderReference
              })
            }
          );
          
          if (updateResponse.ok) {
            const updateData = await updateResponse.json();
            console.log('✅ User status force-updated successfully:', updateData);
            
            // Чекаємо додатково, щоб дані точно синхронізувались
            console.log('⏳ Waiting additional 2 seconds for data sync...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.warn('⚠️ Failed to force-update user status, callback will handle it');
          }
        } catch (err) {
          console.warn('⚠️ Error force-updating user status:', err);
        }
        
        // Call success callback
        if (onSuccess) {
          setTimeout(() => {
            console.log('Executing onSuccess callback now');
            onSuccess();
          }, 2000);
        }
      },
      function onDeclined() {
        // Payment declined
        console.log('❌ Payment declined by WayForPay widget');
        setPaymentStatus('failed');
        setError('Оплату відхилено');
        setLoading(false);
      },
      function onPending() {
        // Payment pending
        console.log('⏳ Payment pending');
        setPaymentStatus('processing');
        
        // Poll payment status
        let pollCount = 0;
        const maxPolls = 20; // 1 minute total
        
        const interval = setInterval(async () => {
          pollCount++;
          const status = await checkPaymentStatus(paymentData.orderReference);
          
          if (status || pollCount >= maxPolls) {
            clearInterval(interval);
            if (!status && pollCount >= maxPolls) {
              setPaymentStatus('failed');
              setError('Час очікування оплати вичерпано');
              setLoading(false);
            }
          }
        }, 3000);
      });

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Помилка оплати');
      setPaymentStatus('failed');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load WayForPay script on component mount
    if (typeof (window as any).Wayforpay === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://secure.wayforpay.com/server/pay-widget.js';
      script.id = 'widget-wfp-script';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        const existingScript = document.getElementById('widget-wfp-script');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, []);

  // Auto-call onSuccess after showing success message
  useEffect(() => {
    if (paymentStatus === 'success' && onSuccess) {
      console.log('Payment success - calling onSuccess after 2 seconds');
      const timeout = setTimeout(() => {
        console.log('Executing onSuccess callback now');
        onSuccess();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [paymentStatus, onSuccess]);

  if (paymentStatus === 'success') {
    return (
      <div className="text-center space-y-4 p-8 bg-white/70 rounded-3xl border-2" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(45,90,61,0.1)' }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: '#2d5a3d' }} />
          </div>
        </div>
        <h3 className="text-2xl" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>
          Оплата успішна!
        </h3>
        <p style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Ваш тариф "{currentTier.name}" активовано
        </p>
        <p className="text-sm" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif', opacity: 0.7 }}>
          Якщо тариф не активувався автоматично, будь ласка, оновіть сторінку через 1-2 хвилини або зверніться в підтримку
        </p>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="text-center space-y-4 p-8 bg-white/70 rounded-3xl border-2" style={{ borderColor: 'rgba(217,74,74,0.13)' }}>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(217,74,74,0.1)' }}>
            <XCircle className="w-10 h-10" style={{ color: '#d94a4a' }} />
          </div>
        </div>
        <h3 className="text-2xl" style={{ color: '#d94a4a', fontFamily: "'Dela Gothic One', sans-serif" }}>
          Помилка оплати
        </h3>
        {error && (
          <p style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
            {error}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handlePayment}
            style={{ backgroundColor: '#d94a4a', color: 'white', fontFamily: 'Arial, sans-serif' }}
          >
            Спробувати знову
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              style={{ borderColor: '#d94a4a', color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}
            >
              Скасувати
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-white/70 rounded-3xl border-2" style={{ borderColor: `${currentTier.color}30` }}>
      <div>
        <h3 className="text-2xl md:text-3xl mb-2" style={{ color: currentTier.color, fontFamily: "'Dela Gothic One', sans-serif" }}>
          Оплата тарифу
        </h3>
        <p className="text-lg" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Тариф: <span style={{ color: currentTier.color }}>{currentTier.name}</span>
        </p>
        <p className="text-3xl mt-2" style={{ color: currentTier.color, fontFamily: 'Arial, sans-serif' }}>
          {currentTier.currency}{currentTier.amount}
        </p>
        <p className="text-sm mt-1" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif', opacity: 0.7 }}>
          Оплата в гривні за курсом WayForPay
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(217,74,74,0.1)', borderColor: '#d94a4a', border: '2px solid' }}>
          <p style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {/* Текст про згоду з документами */}
        <div className="text-center text-sm px-2 pb-2" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          <p>
            Натискаючи кнопку оплати, ви погоджуєтесь з{' '}
            <a 
              href="/offer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              style={{ color: '#2d5a3d' }}
            >
              договором публічної оферти
            </a>
            {' '}та{' '}
            <a 
              href="/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              style={{ color: '#2d5a3d' }}
            >
              політикою конфіденційності
            </a>
          </p>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          style={{ backgroundColor: currentTier.color, color: 'white', fontFamily: 'Arial, sans-serif' }}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Обробка...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Оплатити {currentTier.amount} {currentTier.currency}
            </>
          )}
        </Button>

        {/* DEMO MODE - Remove in production */}
        <Button
          onClick={async () => {
            console.log('DEMO: Button clicked - starting simulation');
            setLoading(true);
            setError(null);
            
            try {
              const token = localStorage.getItem('advent_access_token');
              console.log('DEMO: Token retrieved:', token ? 'exists' : 'missing');
              
              console.log('DEMO: Sending request to /payment/demo-success with tier:', tier);
              const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/demo-success`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ tier })
                }
              );
              
              console.log('DEMO: Response status:', response.status);
              const responseText = await response.text();
              console.log('DEMO: Response body:', responseText);
              
              if (response.ok) {
                console.log('DEMO: Payment successful - setting success state');
                setPaymentStatus('success');
                setLoading(false);
                
                console.log('DEMO: Calling onSuccess callback after 2 seconds');
                if (onSuccess) {
                  setTimeout(() => {
                    console.log('DEMO: Executing onSuccess callback now');
                    onSuccess();
                  }, 2000);
                } else {
                  console.warn('DEMO: onSuccess callback is not defined!');
                }
              } else {
                console.error('DEMO: Payment failed with status:', response.status);
                throw new Error('Demo payment failed: ' + responseText);
              }
            } catch (error) {
              console.error('DEMO payment error:', error);
              setError('Помилка тестової оплати: ' + (error instanceof Error ? error.message : String(error)));
              setPaymentStatus('failed');
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full py-4 text-sm rounded-xl transition-all duration-300"
          style={{ backgroundColor: '#e6963a', color: 'white', fontFamily: 'Arial, sans-serif', opacity: 0.7 }}
        >
          🧪 DEMO: Симуляція успішної оплати
        </Button>

        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full py-6 text-lg rounded-xl"
            style={{ borderColor: currentTier.color, color: currentTier.color, fontFamily: 'Arial, sans-serif' }}
          >
            Скасувати
          </Button>
        )}
      </div>

      <p className="text-sm text-center" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif', opacity: 0.7 }}>
        Безпечна оплата через WayForPay
      </p>
    </div>
  );
}