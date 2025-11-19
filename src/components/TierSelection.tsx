import { useState } from 'react';
import { Button } from './ui/button';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { WayForPayPayment } from './WayForPayPayment';

interface TierSelectionProps {
  userEmail: string;
  currentTier?: string;
  onSuccess: () => void;
  onBack: () => void;
}

const tiers = [
  {
    id: 'basic',
    name: 'Світло',
    price: 10,
    color: '#2d5a3d',
    description: '24 дні практик',
    features: [
      'Доступ до календаря на місяць',
      'Щоденні практики',
      'Базові матеріали від експертів',
      'Трекер прогресу',
      'Спільнота учасників',
    ]
  },
  {
    id: 'deep',
    name: 'Магія',
    price: 35,
    color: '#d94a4a',
    description: '+ чати, ефіри',
    features: [
      'Все з тарифу "Світло"',
      'Розширені PDF-гайди',
      'Додаткові бонуси від експертів',
      'Доступ до всіх практик на 3 місяці',
      'Щотижневі live-ефіри',
      'Персональні рекомендації',
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Диво',
    price: 100,
    color: '#e6963a',
    description: '+ консультація, lifetime',
    features: [
      'Все з тарифу "Магія"',
      'VIP-доступ до всіх матеріалів',
      'Індивідуальна консультація з одним з експертів',
      'Додаткові 3 ефіри з амбасадорами проєкту',
      'Закрита VIP спільнота',
      'Бонусні подарунки',
      'Пріоритетна підтримка',
    ]
  }
];

export function TierSelection({ userEmail, currentTier, onSuccess, onBack }: TierSelectionProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    onSuccess();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedTier(null);
  };

  if (showPayment && selectedTier) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#e8e4e1' }}>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Button
            variant="ghost"
            onClick={handlePaymentCancel}
            className="mb-6 hover:bg-[#2d5a3d]/10"
            style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад до вибору тарифу
          </Button>

          <WayForPayPayment
            tier={selectedTier as 'basic' | 'deep' | 'premium'}
            userEmail={userEmail}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#e8e4e1' }}>
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-[#2d5a3d]/10"
          style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Назад
        </Button>

        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-5xl lg:text-[60px] leading-tight mb-4" 
            style={{ 
              color: '#2d5a3d',
              fontFamily: "'Dela Gothic One', sans-serif",
              letterSpacing: '-2px'
            }}
          >
            Оберіть свій тариф
          </h1>
          <p className="text-xl md:text-2xl" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
            Розпочніть свою трансформацію вже сьогодні
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-visible group flex flex-col ${
                tier.popular ? 'md:scale-105 border-4' : ''
              }`}
              style={{ 
                borderColor: tier.popular ? tier.color : `${tier.color}30`
              }}
            >
              {tier.popular && (
                <div 
                  className="absolute -top-3 sm:-top-4 right-3 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm"
                  style={{ backgroundColor: tier.color, color: 'white', fontFamily: 'Arial, sans-serif' }}
                >
                  Популярний
                </div>
              )}

              <div className={`relative space-y-4 sm:space-y-6 flex-grow ${tier.popular ? 'mt-4' : ''}`}>
                <div>
                  <h3 
                    className="text-2xl sm:text-3xl mb-2" 
                    style={{ color: tier.color, fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}
                  >
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span 
                      className="text-4xl sm:text-5xl" 
                      style={{ color: tier.color, fontFamily: 'Arial, sans-serif' }}
                    >
                      €{tier.price}
                    </span>
                  </div>
                  <p 
                    className="text-sm mt-2 opacity-70" 
                    style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
                  >
                    {tier.description}
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 
                        className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" 
                        style={{ color: tier.color }} 
                      />
                      <span 
                        className="text-sm sm:text-base" 
                        style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleTierSelect(tier.id)}
                className="w-full py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                style={{ 
                  backgroundColor: tier.color, 
                  color: 'white', 
                  fontFamily: 'Arial, sans-serif' 
                }}
              >
                Обрати тариф
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}