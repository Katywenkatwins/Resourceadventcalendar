import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    const verifyPayment = async () => {
      const orderReference = searchParams.get('orderReference');
      
      if (!orderReference) {
        console.error('❌ No orderReference in URL');
        setVerificationStatus('failed');
        setIsVerifying(false);
        return;
      }

      console.log('🔍 Verifying payment:', orderReference);

      try {
        // Перевіряємо статус платежу через WayForPay API
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/check-wayforpay-status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ orderReference })
          }
        );

        const result = await response.json();
        console.log('✅ Payment verification result:', result);

        if (result.success) {
          setVerificationStatus('success');
          
          // Auto-redirect after 5 seconds
          setTimeout(() => {
            navigate('/calendar');
          }, 5000);
        } else {
          console.error('❌ Payment not verified:', result.message);
          setVerificationStatus('failed');
        }
      } catch (error) {
        console.error('❌ Error verifying payment:', error);
        setVerificationStatus('failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  const handleGoToCalendar = () => {
    navigate('/calendar');
  };

  // Показуємо статус перевірки
  if (isVerifying || verificationStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#e8e4e1' }}>
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 text-center" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 animate-spin" style={{ color: '#2d5a3d' }} />
            </div>

            <h1 
              className="text-4xl md:text-5xl mb-4" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              Перевіряємо оплату...
            </h1>

            <p className="text-xl md:text-2xl" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Зачекайте, будь ласка
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Якщо перевірка не пройшла
  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#e8e4e1' }}>
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 text-center" style={{ borderColor: 'rgba(206,46,46,0.3)' }}>
            <h1 
              className="text-4xl md:text-5xl mb-4" 
              style={{ 
                color: '#CE2E2E',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              Помилка перевірки
            </h1>

            <p className="text-xl md:text-2xl mb-8" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Не вдалося підтвердити оплату. Зверніться до адміністратора.
            </p>

            <Button
              onClick={handleGoToCalendar}
              size="lg"
              className="px-12 py-7 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1', fontFamily: 'Arial, sans-serif' }}
            >
              <Calendar className="w-6 h-6 mr-2" />
              Перейти до календаря
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#e8e4e1' }}>
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 text-center" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
          <div className="flex justify-center mb-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: 'rgba(45,90,61,0.1)' }}
            >
              <CheckCircle2 className="w-16 h-16" style={{ color: '#2d5a3d' }} />
            </div>
          </div>

          <h1 
            className="text-4xl md:text-5xl mb-4" 
            style={{ 
              color: '#2d5a3d',
              fontFamily: "'Dela Gothic One', sans-serif",
              letterSpacing: '-2px'
            }}
          >
            Оплата успішна!
          </h1>

          <p className="text-xl md:text-2xl mb-8" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
            Дякуємо за підтримку! Ваш тариф активовано.
          </p>

          <p className="mb-8" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif', opacity: 0.7 }}>
            Переходимо до календаря через 5 секунд...
          </p>

          <Button
            onClick={handleGoToCalendar}
            size="lg"
            className="px-12 py-7 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1', fontFamily: 'Arial, sans-serif' }}
          >
            <Calendar className="w-6 h-6 mr-2" />
            Перейти до календаря
          </Button>
        </div>
      </div>
    </div>
  );
}
