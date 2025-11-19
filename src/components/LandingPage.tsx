import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sparkles, Gift, Heart, Target, Shield, Globe, CheckCircle2, Calendar, Star, Wind } from 'lucide-react';
import ChristmasTree from '../imports/Frame48097540';
import ChristmasBalls from '../imports/Frame48097541';
import CandyCane from '../imports/Vector';
import SnowflakeIcon from '../imports/Frame48097537';
import GiftsWithDecor from '../imports/Vector-43-1850';
import GiftsDecoration from '../imports/Vector2-51-1334';
import SnowflakeDecor from '../imports/Frame48097520';
import svgPaths from '../imports/svg-wnnef39ojp';

interface LandingPageProps {
  onStart: () => void;
  isAuthenticated?: boolean;
  onGoToCalendar?: () => void;
}

// Декоративні SVG елементи з Figma
function DecorativeBalls1() {
  return (
    <div className="absolute bottom-0 left-0 right-0 top-0">
      <div className="absolute inset-[30.32%_38.15%_38.93%_15.83%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 70">
          <path d={svgPaths.p389e8200} fill="#CF7A2C" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-[45.07%] top-[63.26%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 83 83">
          <path d={svgPaths.p7fe9270} fill="#12213E" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[24.82%_57.44%_69.39%_35.12%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13">
          <path d={svgPaths.p3f476200} fill="#CF7A2C" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[32.4%_26.82%_61.82%_65.74%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13">
          <path d={svgPaths.p3f476200} fill="#CE2E2E" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[58.18%_68.77%_36.04%_23.79%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 13">
          <path d={svgPaths.p3f476200} fill="#12213E" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[0.95%_61.57%_74.8%_38.41%]">
        <div className="absolute bottom-[-1.06%] left-[-2265.88%] right-[-2265.89%] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 56">
            <path d={svgPaths.p3abe5e60} opacity="0.9" stroke="#CF7A2C" strokeWidth="1.29758" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[1.36%_30.75%_66.94%_69.25%]">
        <div className="absolute bottom-0 left-[-0.65px] right-[-0.65px] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 72">
            <path d="M0.648788 71.172V0" opacity="0.9" stroke="#CE2E2E" strokeWidth="1.29758" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[41.59%] left-[27.64%] right-[72.36%] top-0">
        <div className="absolute bottom-0 left-[-0.65px] right-[-0.65px] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 132">
            <path d="M0.648788 131.12V0" opacity="0.9" stroke="#12213E" strokeWidth="1.29758" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[22.05%] left-[38.84%] right-0 top-[37.08%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 92 92">
          <path d={svgPaths.pd7d0200} fill="#CE2E2E" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

function DecorativeCandy() {
  return (
    <div className="absolute bottom-0 left-0 right-[0.15%] top-0">
      <div className="absolute bottom-0 left-0 right-[0.15%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 193 238">
          <path d={svgPaths.p20415600} fill="#CF3C32" />
        </svg>
      </div>
    </div>
  );
}

function DecorativeGift() {
  return (
    <div className="h-[143.02px] w-[96.322px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 97 144">
        <g opacity="0.4">
          <path d={svgPaths.p10bd0900} fill="#D98E29" />
          <path d={svgPaths.p3a20a770} fill="#14334A" />
          <path d={svgPaths.p2e5d1e70} fill="#14334A" />
          <path d={svgPaths.pef4bc80} fill="#14334A" />
        </g>
      </svg>
    </div>
  );
}

export function LandingPage({ onStart, isAuthenticated, onGoToCalendar }: LandingPageProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const handleMainAction = () => {
    if (isAuthenticated && onGoToCalendar) {
      onGoToCalendar();
    } else {
      onStart();
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const adventStart = new Date('2024-12-01T00:00:00');
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = adventStart.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      number: '1',
      title: 'Реєструєшся і обираєш свій тариф',
      description: 'Після оплати отримаєш доступ до інтерактивного календаря. Та запрошення в ТГ-канал спільноти',
      color: '#2d5a3d',
      bgColor: 'rgba(45,90,61,0.13)',
      borderColor: 'rgba(45,90,61,0.19)',
      DecorIcon: DecorativeBalls1,
    },
    {
      number: '2',
      title: 'Щодня о 6:00 ранку відкривається нова "дверцята"',
      description: 'Всередині — коротке відео від експерта, практика чи медитація, чек-лист або гайд.',
      color: '#d94a4a',
      bgColor: 'rgba(217,74,74,0.13)',
      borderColor: 'rgba(217,74,74,0.19)',
      DecorIcon: DecorativeCandy,
    },
    {
      number: '3',
      title: 'Виконуєш і відмічаєш "готово"',
      description: 'Спостерігай, як наповнюється твій ресурс і прогрес-бар — день за днем. А вкінці розіграш для тих, хто пройшов всі 24 дні з нами',
      color: '#e6963a',
      bgColor: 'rgba(230,150,58,0.13)',
      borderColor: 'rgba(230,150,58,0.19)',
      DecorIcon: DecorativeGift,
    },
  ];

  const themes = [
    { text: 'Заспокоїти тіло', icon: Heart },
    { text: 'Зміцнити емоції', icon: Sparkles },
    { text: 'Висвітлити цінності', icon: Star },
    { text: 'Укріпити кордони', icon: Shield },
    { text: 'Розширити бачення', icon: Globe },
    { text: 'Відпустити минуле', icon: Wind },
    { text: 'Налаштуватися на дію', icon: Target },
    { text: '…і ще 17 кроків твоєї магічної подорожі', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#e8e4e1' }}>
      {/* Декоративні фонові елементи */}
      <div className="fixed top-[-20px] left-0 opacity-20 pointer-events-none z-0">
        <ChristmasBalls />
      </div>
      
      <div className="fixed top-20 right-10 opacity-20 pointer-events-none z-0">
        <ChristmasTree />
      </div>
      
      <div className="fixed top-1/2 right-3/5 opacity-25 pointer-events-none z-0 w-[100px]">
        <CandyCane />
      </div>
      
      <div className="fixed bottom-1/4 left-1/2 opacity-20 pointer-events-none z-0 rotate-45 w-[100px]">
        <CandyCane />
      </div>
      
      <div className="fixed bottom-10 left-10 opacity-60 pointer-events-none z-0 w-[200px]">
        <GiftsWithDecor />
      </div>
      
      <div className="fixed bottom-[-120px] right-[-80px] opacity-40 pointer-events-none rotate-15 z-0">
        <SnowflakeIcon />
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32 relative">
          <div className="text-center space-y-6 sm:space-y-8">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[1.2] lg:leading-[48px]" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              24 дні до твого оновлення
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-[24px] max-w-4xl mx-auto leading-relaxed px-4" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Інтерактивна подорож до себе — через практики, енергію й натхнення.
            </p>

            <div className="max-w-3xl mx-auto space-y-4 px-4">
              <p className="text-base sm:text-lg md:text-xl lg:text-[20px] leading-[28px]" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                Щодня відкривай нові дверцята — всередині тебе і на сайті.
              </p>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                Медитації, практики, міні-відео, поради й сюрпризи від 24 експертів —<br className="hidden sm:block" />
                щоб зустріти Новий рік у спокої, ресурсі й натхненні.
              </p>
            </div>

            {/* Timer */}
            <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 mx-4" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
              <p className="text-lg sm:text-xl mb-4" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>Стартуємо 1 грудня</p>
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {[
                  { label: 'Днів', value: timeLeft.days },
                  { label: 'Годин', value: timeLeft.hours },
                  { label: 'Хвилин', value: timeLeft.minutes },
                  { label: 'Секунд', value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-xs sm:text-sm" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 px-4">
              <Button
                onClick={handleMainAction}
                size="lg"
                className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: '#d94a4a', color: 'white', fontFamily: 'Arial, sans-serif' }}
              >
                <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                Взяти участь
              </Button>
              
              <Button
                onClick={scrollToAbout}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ borderColor: '#2d5a3d', color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}
              >
                Дізнатись більше
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16 sm:space-y-24 lg:space-y-32">
        
        {/* About Section */}
        <div id="about-section" className="mt-12 sm:mt-16 lg:mt-24 scroll-mt-24">
          <div className="max-w-4xl mx-auto text-center space-y-6 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-xl border-2" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              Що це за марафон?
            </h2>
            
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg md:text-xl" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              <p className="text-xl sm:text-2xl lg:text-[24px] leading-[32px]" style={{ color: '#2d5a3d', fontWeight: 'bold' }}>
                Це не просто марафон.<br />
                Це 24-денна мандрівка до себе — через тіло, емоції, красу, рух і внутрішню гармонію.
              </p>
              
              <p className="text-sm sm:text-base lg:text-[16px] leading-[24px]">
                Кожного ранку відкривай нові "дверцята" у нашому інтерактивному календарі, де тебе чекають відео-привітання, практика, поради й подарунки від експертів у своїй сфері.
              </p>
              
              <p className="text-lg sm:text-xl lg:text-[24px] leading-[32px] pt-4" style={{ color: '#d94a4a' }}>
                Ніяких довгих лекцій — лише 10–15 хвилин на день, щоб наповнитись і налаштуватись на новий рік.
              </p>
            </div>

            <div className="pt-8">
              <div className="inline-block bg-gradient-to-b from-[#2d5a3d] to-[#1e3a5f] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg">
                <Calendar className="inline-block w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                <span className="text-base sm:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>всередині тебе чекає 24 двері до ресурсу</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="space-y-8 sm:space-y-12">
          <h2 
            className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
            style={{ 
              color: '#2d5a3d',
              fontFamily: "'Dela Gothic One', sans-serif",
              letterSpacing: '-2px'
            }}
          >
            Як усе відбувається
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden min-h-[280px] sm:min-h-[300px]"
                style={{ borderColor: step.borderColor }}
              >
                <div 
                  className="absolute size-12 rounded-full flex items-center justify-center left-6 sm:left-8 top-6 sm:top-8"
                  style={{ backgroundColor: step.bgColor }}
                >
                  <span className="text-xl sm:text-2xl" style={{ color: step.color, fontFamily: 'Arial, sans-serif' }}>{step.number}</span>
                </div>
                
                <h3 className="text-base sm:text-lg md:text-xl leading-[28px] mt-20 sm:mt-24 mb-3 sm:mb-4" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base leading-[24px]" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                  {step.description}
                </p>

                {/* Декоративний елемент */}
                {idx === 0 && (
                  <div className="absolute right-[-30px] top-[-10px] w-[150px] h-[224px] opacity-20 pointer-events-none">
                    <DecorativeBalls1 />
                  </div>
                )}
                {idx === 1 && (
                  <div className="absolute right-[-20px] top-[-30px] w-[193px] h-[217px] opacity-40 pointer-events-none rotate-[9.7deg]">
                    <DecorativeCandy />
                  </div>
                )}
                {idx === 2 && (
                  <div className="absolute right-[20px] top-0 opacity-40 pointer-events-none rotate-[8.8deg]">
                    <DecorativeGift />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* What You'll Get Section */}
        <div className="space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              Що ти отримаєш
            </h2>
            <p className="text-xl sm:text-2xl lg:text-[24px] leading-[32px]" style={{ color: '#1e3a5f', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
              24 кроки до твого оновлення
            </p>
            <p className="text-lg sm:text-xl lg:text-[20px] leading-[28px]" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Кожен день — нова тема, нова грань тебе.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {themes.map((theme, idx) => {
              const IconComponent = theme.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  style={{ borderColor: 'rgba(45,90,61,0.13)' }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#2d5a3d' }} />
                    </div>
                    <span className="text-base sm:text-lg leading-[28px]" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                      {theme.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#2d5a3d] to-[#1e3a5f] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-xl text-white space-y-4 sm:space-y-6 relative overflow-hidden">
            {/* Декоративні подарунки в правому нижньому куті - під текстом */}
            <div className="absolute bottom-[-20px] right-[-30px] opacity-100 pointer-events-none w-[150px] sm:w-[180px] z-0">
              <GiftsDecoration />
            </div>
            
            <p className="text-xl sm:text-2xl text-center mb-4 sm:mb-6 relative z-10" style={{ fontFamily: 'Arial, sans-serif' }}>Після проходження марафону ти:</p>
            <div className="space-y-3 sm:space-y-4 relative z-10">
              {[
                'відчуєш глибший зв\'язок із тілом та енергією,',
                'очистиш розум і навчишся легко відновлювати ресурс,',
                'побачиш своє "нове я" — спокійне, впевнене й цілісне.',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-1" />
                  <p className="text-base sm:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Experts Section */}
        <div className="space-y-8 sm:space-y-12">
          <h2 
            className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px]" 
            style={{ 
              color: '#2d5a3d',
              fontFamily: "'Dela Gothic One', sans-serif",
              letterSpacing: '-2px'
            }}
          >
            Хто з тобою
          </h2>
          
          <div className="text-center space-y-4">
            <p className="text-2xl sm:text-3xl" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>
              24 експерти. 24 джерела сили.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-xl border-2 space-y-4 sm:space-y-6" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <p className="text-lg sm:text-xl text-center" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              У календарі ти зустрінеш:
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              <strong style={{ color: '#2d5a3d' }}>йога-інструкторів</strong>, <strong style={{ color: '#2d5a3d' }}>психологів</strong>, <strong style={{ color: '#2d5a3d' }}>астрологів</strong>, <strong style={{ color: '#2d5a3d' }}>нутріціологів</strong>, <strong style={{ color: '#2d5a3d' }}>експертів із краси</strong>, <strong style={{ color: '#2d5a3d' }}>стилю</strong>,
              <strong style={{ color: '#2d5a3d' }}> енергопрактиків</strong>, <strong style={{ color: '#2d5a3d' }}>музикантів</strong>, <strong style={{ color: '#2d5a3d' }}>маркетологів</strong>, <strong style={{ color: '#2d5a3d' }}>арт-терапевтів</strong> і ще багатьох інших.
            </p>

            <p className="text-lg sm:text-xl text-center pt-4" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>
              Кожен із них — світло у своїй сфері, і вони поділяться з тобою своїм ресурсом.
            </p>

            {/* Expert Grid Placeholder */}
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 sm:gap-4 pt-6 sm:pt-8">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-full bg-gradient-to-br from-[#2d5a3d] to-[#e6963a] opacity-20 hover:opacity-40 transition-opacity duration-300"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight sm:leading-[48px] px-4" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              Обери свій рівень подорожі
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
            {/* Basic Tier - Світло */}
            <div className="bg-white/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group"
                 style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
              <div className="relative space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl mb-2" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Світло</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>€10</span>
                  </div>
                  <p className="text-sm mt-2 opacity-70" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>24 дні практик</p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {[
                    'Доступ до календаря',
                    'Щоденні практики',
                    'Базові матеріали від експертів',
                    'Трекер прогресу',
                    'Спільнота учасників',
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" style={{ color: '#2d5a3d' }} />
                      <span className="text-sm sm:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleMainAction}
                  className="w-full py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: '#2d5a3d', color: 'white', fontFamily: 'Arial, sans-serif' }}
                >
                  {isAuthenticated ? 'Обрати тариф' : 'Взяти участь'}
                </Button>
              </div>
            </div>

            {/* Premium Tier - Магія */}
            <div className="bg-white/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-4 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 relative overflow-visible group transform md:scale-105"
                 style={{ borderColor: '#d94a4a' }}>
              <div className="absolute -top-3 sm:-top-4 right-3 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm" 
                   style={{ backgroundColor: '#d94a4a', color: 'white', fontFamily: 'Arial, sans-serif' }}>
                Популярний
              </div>
              
              <div className="relative space-y-4 sm:space-y-6 mt-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl mb-2" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Магія</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>€35</span>
                  </div>
                  <p className="text-sm mt-2 opacity-70" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>+ чати, ефіри</p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {[
                    'Все з тарифу "Світло"',
                    'Розширені PDF-гайди',
                    'Додаткові відео від експертів',
                    'Доступ до архіву практик',
                    'Щотижневі live-ефіри',
                    'Персональні рекомендації',
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" style={{ color: '#d94a4a' }} />
                      <span className="text-sm sm:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleMainAction}
                  className="w-full py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  style={{ backgroundColor: '#d94a4a', color: 'white', fontFamily: 'Arial, sans-serif' }}
                >
                  {isAuthenticated ? 'Обрати тариф' : 'Взяти участь'}
                </Button>
              </div>
            </div>

            {/* VIP Tier - Чудо */}
            <div className="bg-white/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group"
                 style={{ borderColor: 'rgba(230,150,58,0.13)' }}>
              <div className="relative space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl mb-2" style={{ color: '#e6963a', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Чудо</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl" style={{ color: '#e6963a', fontFamily: 'Arial, sans-serif' }}>€100</span>
                  </div>
                  <p className="text-sm mt-2 opacity-70" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>+ консультація, lifetime</p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {[
                    'Все з тарифу "Магія"',
                    'VIP-доступ до всіх матеріалів',
                    'Індивідуальна консультація',
                    'Персональний план',
                    'Закрита VIP спільнота',
                    'Бонусні подарунки',
                    'Пріоритетна підтримка',
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" style={{ color: '#e6963a' }} />
                      <span className="text-sm sm:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleMainAction}
                  className="w-full py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: '#e6963a', color: 'white', fontFamily: 'Arial, sans-serif' }}
                >
                  {isAuthenticated ? 'Обрати тариф' : 'Взяти участь'}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-base sm:text-lg mt-6 sm:mt-8 max-w-2xl mx-auto px-4" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
            Кожен тариф відкриває свій рівень глибини.<br />
            Обери той, який відповідає твоєму стану зараз 💛
          </p>
        </div>

        {/* Testimonial Section */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#d94a4a] to-[#e6963a] rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl text-white text-center space-y-4 sm:space-y-6 relative overflow-hidden">
            {/* Декоративна сніжинка в правому куті - під текстом */}
            <div className="absolute bottom-[-50px] right-[-20px] sm:right-[-50px] opacity-100 pointer-events-none w-[150px] sm:w-[200px] rotate-180 scale-y-[-100%] z-0">
              <SnowflakeDecor />
            </div>
            
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center relative z-10">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl italic leading-relaxed relative z-10" style={{ fontFamily: 'Arial, sans-serif' }}>
              "Ми створили цей календар, щоб нагадати кожній жінці:<br className="hidden sm:block" />
              новорічне диво — це ти."
            </p>
            <p className="text-lg sm:text-xl opacity-90 relative z-10" style={{ fontFamily: 'Arial, sans-serif' }}>
              — Катерина Сміян, авторка проєкту
            </p>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="text-center space-y-6 sm:space-y-8 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-xl border-2 mx-4" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl" 
            style={{ 
              color: '#2d5a3d',
              fontFamily: "'Dela Gothic One', sans-serif",
              letterSpacing: '-2px'
            }}
          >
            Готова відкрити першу дверцята?
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
            Не чекай нового року, щоб змінитись.<br />
            Почни вже зараз — з першого кроку до себе.
          </p>

          <div className="pt-4">
            <Button
              onClick={handleMainAction}
              size="lg"
              className="w-full sm:w-auto mx-auto px-12 sm:px-16 py-6 sm:py-8 text-xl sm:text-2xl rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center gap-2 justify-center"
              style={{ backgroundColor: '#d94a4a', color: 'white', fontFamily: 'Arial, sans-serif' }}
            >
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
              Приєднатись до календаря
            </Button>
          </div>

          {/* Timer */}
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-[#2d5a3d] to-[#1e3a5f] rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl text-white mt-6 sm:mt-8">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              <p className="text-base sm:text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>До старту залишилось:</p>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {[
                { label: 'Днів', value: timeLeft.days },
                { label: 'Годин', value: timeLeft.hours },
                { label: 'Хвилин', value: timeLeft.minutes },
                { label: 'Секунд', value: timeLeft.seconds },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs opacity-80" style={{ fontFamily: 'Arial, sans-serif' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 py-8 sm:py-12 mt-16 sm:mt-24" style={{ borderColor: 'rgba(45,90,61,0.13)', backgroundColor: '#faf8f5' }}>
        <div className="max-w-6xl mx-auto px-4 text-center space-y-3 sm:space-y-4">
          <p className="text-base sm:text-lg" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>
            © 2025 "Адвент календар ресурсного наповнення"
          </p>
          <p className="text-base sm:text-lg" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>
            Створено з любов'ю 💛
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm pt-4" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
            <button className="hover:underline">Контакти</button>
            <button className="hover:underline">Політика конфіденційності</button>
            <button className="hover:underline">Підтримка</button>
          </div>
        </div>
      </footer>
    </div>
  );
}