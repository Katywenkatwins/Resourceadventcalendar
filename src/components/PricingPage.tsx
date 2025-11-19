import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Check, Sparkles, Flame, Star, Home, LogOut } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PricingPageProps {
  onPaymentSuccess: (tier: 'basic' | 'deep' | 'premium') => void;
  userName: string;
  onBackToHome?: () => void;
  onSignOut?: () => void;
}

const tiers = [
  {
    id: 'basic',
    name: 'Світло',
    price: 10,
    icon: Sparkles,
    color: 'from-amber-400 to-orange-500',
    features: [
      'Доступ до всіх 24 "дверцят" марафону',
      'Відео, практики, матеріали',
      '25 днів доступу з моменту реєстрації',
      'Особистий прогрес-бар',
      'Email-нагадування щодня',
      'PDF-гайд "План оновлення на 2026 рік"',
    ],
  },
  {
    id: 'deep',
    name: 'Магія',
    price: 35,
    icon: Flame,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      'Все з тарифу "Світло"',
      '4 спільні ефіри з експертами',
      'Доступ до чату учасниць',
      'Медитації в аудіо форматі',
      'Міні-чеклісти у PDF',
      '3 бонусні дні після 24-го з подарунками',
      'Доступ до записів ефірів 1 місяць',
    ],
  },
  {
    id: 'premium',
    name: 'Чудо',
    price: 100,
    icon: Star,
    color: 'from-indigo-500 to-purple-600',
    features: [
      'Все з попередніх тарифів',
      'Персональна консультація від топ-експерта',
      'Закрита зустріч після марафону',
      'Lifetime доступ до марафону',
      'Ексклюзивні розширені матеріали',
      "Ім'я в розділі Ambassadors",
      'Спеціальний подарунок від організаторки',
    ],
  },
];

export function PricingPage({ onPaymentSuccess, userName, onBackToHome, onSignOut }: PricingPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handlePayment = async (tierId: 'basic' | 'deep' | 'premium', price: number) => {
    setIsProcessing(true);
    setSelectedTier(tierId);

    try {
      // In a real application, this would integrate with WayforPay
      // For now, we'll simulate the payment process
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get access token
      const accessToken = localStorage.getItem('advent_access_token');
      if (!accessToken) {
        alert('Помилка авторизації. Увійдіть знову.');
        return;
      }

      // Confirm payment on backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/confirm-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            tier: tierId,
            transaction_id: `DEMO_${Date.now()}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Помилка підтвердження оплати');
      }

      // Success!
      onPaymentSuccess(tierId);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Помилка обробки платежу. Спробуйте ще раз.');
    } finally {
      setIsProcessing(false);
      setSelectedTier(null);
    }
  };

  const openWayForPay = (tierId: 'basic' | 'deep' | 'premium', price: number) => {
    // In production, this would open WayforPay payment widget
    // For demo purposes, we'll show a confirmation and simulate payment
    if (confirm(`Перейти до оплати тарифу за €${price}?\n\n(Це демо-режим. Реальна інтеграція з WayforPay буде додана пізніше)`)) {
      handlePayment(tierId, price);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ede9e3] via-[#faf8f5] to-[#ede9e3] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">
            Привіт, {userName}! 👋
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Обери свій шлях трансформації
          </p>
          <p className="text-gray-500">
            24 кроки до нового себе чекають на тебе
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === tier.id;
            
            return (
              <Card
                key={tier.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  tier.popular ? 'border-2 border-purple-500 scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm">
                    Популярний
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <div className="text-4xl mb-2">
                    €{tier.price}
                  </div>
                  <CardDescription>одноразовий платіж</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => openWayForPay(tier.id as any, tier.price)}
                    disabled={isProcessing}
                    className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 text-white`}
                  >
                    {isSelected && isProcessing ? 'Обробка...' : 'Обрати тариф'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-gray-600 max-w-2xl mx-auto">
          <p className="mb-2">
            💳 Оплата здійснюється через WayforPay - безпечний платіжний сервіс
          </p>
          <p>
            🔒 Після оплати ви отримаєте лист з підтвердженням та доступ до календаря
          </p>
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={onBackToHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
          >
            <Home className="w-4 h-4 mr-1 inline-block" />
            На головну
          </Button>
          <Button
            onClick={onSignOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            <LogOut className="w-4 h-4 mr-1 inline-block" />
            Вийти
          </Button>
        </div>
      </div>
    </div>
  );
}