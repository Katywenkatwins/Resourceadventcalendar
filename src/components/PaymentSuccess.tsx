import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { CheckCircle2, Calendar } from 'lucide-react';

export function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/calendar');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoToCalendar = () => {
    navigate('/calendar');
  };

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
