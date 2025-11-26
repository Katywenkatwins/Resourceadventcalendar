import { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ChevronLeft, ZoomIn, ZoomOut, Maximize2, LogOut, Settings, Unlock } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { calendarDays } from '../data/calendarData';
import { DoorCard } from './DoorCard';
import { LockedDoorCard } from './LockedDoorCard';
import { DoorOpeningAnimation } from './DoorOpeningAnimation';
import { useAuth } from '../App';
import { CountdownTimer } from './CountdownTimer';

interface CalendarViewProps {
  completedDays: Set<number>;
  onDayClick: (day: number) => void;
  onBackToHome: () => void;
  userProfile?: {
    name: string;
    email: string;
    tier: string;
  };
  onSignOut?: () => void;
  onAdminClick?: () => void;
  isAdmin?: boolean;
  adminUnlockAll?: boolean;
  unlockedDays?: number[]; // Дні розблоковані адміном вручну
}

const CANVAS_WIDTH = 5100;
const CANVAS_HEIGHT = 6540;
const MOBILE_SCALE = 0.33; // Приблизно втричі менше для мобільних

export function CalendarView({ completedDays, onDayClick, onBackToHome, userProfile, onSignOut, onAdminClick, isAdmin, adminUnlockAll, unlockedDays }: CalendarViewProps) {
  const [openingDay, setOpeningDay] = useState<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hideCalendar, setHideCalendar] = useState(false);
  const [cardsToRender, setCardsToRender] = useState(3); // Починаємо з 3 карток на мобільному
  const transformFunctionsRef = useRef<any>(null);
  const mouseDownPos = useRef<{ x: number; y: number; time: number } | null>(null);
  
  // Безпечний виклик useAuth
  let toggleAdminUnlockAll = () => {};
  try {
    const auth = useAuth();
    toggleAdminUnlockAll = auth?.toggleAdminUnlockAll || (() => {});
  } catch (e) {
    // Нічого не робимо
  }

  // Debug: Логуємо зміни completedDays
  useEffect(() => {
    console.log('🔄 CalendarView: completedDays оновлено:', Array.from(completedDays));
  }, [completedDays]);

  // Визначаємо чи це мобільний пристрій
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Поступовий рендеринг карток для покращення перформансу на мобільних
  useEffect(() => {
    if (isMobile && cardsToRender < 24) {
      const timer = setTimeout(() => {
        setCardsToRender(prev => Math.min(prev + 6, 24));
      }, 300); // Збільшено з 150ms до 300ms для плавнішого завантаження
      return () => clearTimeout(timer);
    }
    // На десктопі рендеримо всі картки одразу
    if (!isMobile && cardsToRender !== 24) {
      setCardsToRender(24);
    }
  }, [isMobile, cardsToRender]);

  // Розміри canvas в залежності від пристрою
  const canvasWidth = isMobile ? CANVAS_WIDTH * MOBILE_SCALE - 80 : CANVAS_WIDTH - 300;
  // Оптимізовано для мобільного - менша висота для швидшого рендерингу
  const canvasHeight = isMobile ? CANVAS_HEIGHT * MOBILE_SCALE + 1200 : CANVAS_HEIGHT + 1100; // Збільшено висоту щоб не перекривались картки внизу
  const cardScale = isMobile ? MOBILE_SCALE : 1;

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  
  // ДАТА СТАРТУ: 1 грудня 2025 (як в адмін-панелі)
  const CALENDAR_START_DATE = 1;
  const CALENDAR_START_MONTH = 11; // грудень (0-indexed)
  
  // Визначаємо яка зараз дата відносно старту календаря
  const calendarStartDate = new Date(today.getFullYear(), CALENDAR_START_MONTH, CALENDAR_START_DATE);
  const todayDate = new Date(today.getFullYear(), currentMonth, currentDay);
  const daysPassed = Math.floor((todayDate.getTime() - calendarStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const isDayUnlocked = (day: number) => {
    try {
      // Якщо адмін розблокував всі дні - дозволяємо все (тестовий режим)
      if (isAdmin && adminUnlockAll) {
        console.log(`🔓 День ${day}: Розблоковано адміном (тестовий режим)`);
        return true;
      }
      
      // Перевіряємо чи день вже "настав" згідно з налаштуваннями адміна
      const dayHasArrived = unlockedDays && unlockedDays.includes(day);
      
      if (!dayHasArrived) {
        console.log(`🔒 День ${day}: Ще не настав згідно з налаштуваннями адміна. UnlockedDays:`, unlockedDays);
        return false;
      }
      
      // День настав, але користувач має пройти дні ПОСЛІДОВНО
      
      // День 1 завжди відкритий коли він настав
      if (day === 1) {
        console.log(`🔓 День ${day}: Перший день (настав і завжди доступний)`);
        return true;
      }
      
      // Інші дні відкриваються ТІЛЬКИ після виконання попереднього
      const prevCompleted = completedDays.has(day - 1);
      console.log(`${prevCompleted ? '🔓' : '🔒'} День ${day}: День настав, але попередній день ${day - 1} ${prevCompleted ? 'виконано ✅' : 'НЕ виконано ❌'}. Completed days:`, Array.from(completedDays));
      return prevCompleted;
    } catch (error) {
      console.error('Error in isDayUnlocked:', error);
      return false;
    }
  };

  const handleDoorClick = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if this was a click (not a drag)
    if (mouseDownPos.current) {
      const deltaX = Math.abs(e.clientX - mouseDownPos.current.x);
      const deltaY = Math.abs(e.clientY - mouseDownPos.current.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const timeDiff = Date.now() - mouseDownPos.current.time;
      
      // If moved more than 10px or took longer than 500ms, it was a drag
      if (distance > 10 || timeDiff > 500) {
        return;
      }
    }
    
    // Запускаємо 3D анімацію відкриття
    setOpeningDay(day);
    // Ховаємо календар під час анімації
    setHideCalendar(true);
  };

  const handleDoorAnimationComplete = () => {
    if (openingDay !== null) {
      onDayClick(openingDay);
      setOpeningDay(null);
      
      // Через 5 секунд показуємо календар назад (коли користувач вже на сторінці дня)
      setTimeout(() => {
        setHideCalendar(false);
      }, 5000);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
  };

  const handleFitToScreen = (setTransform: any) => {
    if (!setTransform) return;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate scale to fit canvas with padding
    const padding = viewportWidth < 768 ? 20 : 40;
    const currentCanvasWidth = viewportWidth < 768 ? CANVAS_WIDTH * MOBILE_SCALE : CANVAS_WIDTH - 300;
    
    // Використовуємо scaleX (масштаб по ширині) замість Math.min
    const scale = Math.min((viewportWidth - padding * 2) / currentCanvasWidth, 1.0);
    
    // Position at top-left with padding (не центруємо по висоті)
    const posX = padding;
    const posY = viewportWidth < 768 ? 80 : 90; // Зверху з урахуванням header
    
    setTransform(posX, posY, scale, 300);
  };

  const progress = (completedDays.size / 24) * 100;

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-amber-500';
      case 'deep': return 'bg-purple-500';
      case 'premium': return 'bg-indigo-600';
      default: return 'bg-gray-500';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'basic': return 'Світло';
      case 'deep': return 'Магія';
      case 'premium': return 'Диво';
      default: return tier;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: '#e8e4e1', zIndex: 9999 }}>
      {/* Header - Fixed */}
      <div 
        className="absolute top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b transition-opacity duration-300" 
        style={{ 
          borderColor: '#05231120',
          opacity: hideCalendar ? 0 : 1,
          pointerEvents: hideCalendar ? 'none' : 'auto'
        }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Button
                variant="ghost"
                onClick={onBackToHome}
                className="hover:bg-[#052311]/10"
                style={{ color: '#052311' }}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                На головну
              </Button>
              
              {/* Countdown Timer */}
              <div className="hidden lg:block">
                <CountdownTimer compact />
              </div>
              
              {userProfile && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm" style={{ color: '#052311' }}>
                    {userProfile.name}
                  </span>
                  <Badge className={getTierBadgeColor(userProfile.tier)}>
                    {getTierName(userProfile.tier)}
                  </Badge>
                  {/* Debug info */}
                  <span className="text-xs opacity-50" style={{ color: '#052311' }}>
                    ({userProfile.email})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm" style={{ color: '#052311' }}>
                <span>Прогрес:</span>
                <span>{completedDays.size}/24</span>
              </div>
              <Progress value={progress} className="hidden sm:block w-24 md:w-32 h-3" style={{ backgroundColor: '#05231120' }} />
              
              {isAdmin && (
                <Button
                  variant={adminUnlockAll ? "default" : "outline"}
                  size="sm"
                  onClick={toggleAdminUnlockAll}
                  className="flex items-center gap-2"
                  style={adminUnlockAll ? { backgroundColor: '#CE2E2E', color: '#fff' } : { borderColor: '#052311', color: '#052311' }}
                  title={adminUnlockAll ? "Заблокувати дні" : "Розблокувати всі дні"}
                >
                  <Unlock className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{adminUnlockAll ? "Розблоковано" : "Розблокувати"}</span>
                </Button>
              )}
              
              {onAdminClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAdminClick}
                  className="hover:bg-[#052311]/10"
                  style={{ color: '#052311' }}
                  title="Адмін панель"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              )}
              
              {onSignOut && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSignOut}
                  className="hover:bg-[#052311]/10"
                  style={{ color: '#052311' }}
                  title="Вийти"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile Countdown Timer - Visible only on mobile */}
          <div className="lg:hidden border-t px-4 py-2" style={{ borderColor: '#05231120' }}>
            <CountdownTimer compact />
          </div>
        </div>
      </div>

      {/* Zoom Controls - Fixed */}
      <div 
        className="absolute right-4 z-40 transition-opacity duration-300"
        style={{
          top: isMobile ? '120px' : '80px', // Налаштування для мобільного header з лічільником
          opacity: hideCalendar ? 0 : 1,
          pointerEvents: hideCalendar ? 'none' : 'auto'
        }}
      >
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => transformFunctionsRef.current?.zoomIn()}
            size="icon"
            className="bg-white/90 hover:bg-white shadow-lg"
            style={{ color: '#052311' }}
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => transformFunctionsRef.current?.zoomOut()}
            size="icon"
            className="bg-white/90 hover:bg-white shadow-lg"
            style={{ color: '#052311' }}
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => handleFitToScreen(transformFunctionsRef.current?.setTransform)}
            size="icon"
            className="bg-white/90 hover:bg-white shadow-lg"
            style={{ color: '#052311' }}
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Canvas - Full viewport */}
      <div 
        className="absolute inset-0 w-screen h-screen pt-[60px] lg:pt-[60px] transition-opacity duration-300"
        style={{
          paddingTop: isMobile ? '110px' : '60px', // Більше місця для мобільного header з лічільником
          opacity: hideCalendar ? 0 : 1,
          pointerEvents: hideCalendar ? 'none' : 'auto'
        }}
      >
        <TransformWrapper
          initialScale={isMobile ? 0.5 : 0.38}
          minScale={0.05}
          maxScale={1.0}
          centerOnInit={false}
          initialPositionX={isMobile ? -50 : -150}
          initialPositionY={90}
          limitToBounds={true}
          minPositionX={typeof window !== 'undefined' ? window.innerWidth - (canvasWidth * 0.38) - 50 : -3000}
          maxPositionX={0}
          minPositionY={typeof window !== 'undefined' ? window.innerHeight - (canvasHeight * 0.38) - 100 : -3000}
          maxPositionY={90}
          disablePadding={true}
          wheel={{ 
            step: 0.08,
            smoothStep: 0.005,
            disabled: isMobile
          }}
          doubleClick={{ disabled: isMobile, step: 0.5 }}
          panning={{ 
            disabled: false,
            velocityDisabled: isMobile // Вимикаємо velocity на мобілному для стабільності
          }}
          onPanningStart={() => {
            setIsPanning(true);
          }}
          onPanningStop={() => {
            setIsPanning(false);
          }}
        >
          {({ zoomIn, zoomOut, setTransform }) => {
            // Store functions in ref for external access
            transformFunctionsRef.current = { zoomIn, zoomOut, setTransform };
            
            return (
              <TransformComponent
                wrapperStyle={{
                  width: '100vw',
                  height: '100vh',
                  cursor: isPanning ? 'grabbing' : 'grab'
                }}
                contentStyle={{
                  willChange: 'transform',
                  transform: 'translateZ(0)' // GPU acceleration
                }}
              >
                {/* Canvas with all cards */}
                <div 
                  className="relative"
                  style={{
                    width: `${canvasWidth}px`,
                    height: `${canvasHeight}px`,
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {calendarDays
                    .slice(0, cardsToRender) // Рендеримо тільки потрібну кількість карток
                    .map((day) => {
                    const isUnlocked = isDayUnlocked(day.day);
                    const isCompleted = completedDays.has(day.day);
                    const isToday = daysPassed === day.day; // Сьогоднішній день календаря
                    const isOpening = openingDay === day.day;

                    return (
                      <div
                        key={day.day}
                        className={`
                          absolute
                          ${isOpening ? 'z-50' : 'z-10'}
                        `}
                        style={{
                          left: `${day.position.x * cardScale}px`,
                          top: `${day.position.y * cardScale}px`,
                          transform: isOpening ? 'scale(1.1)' : 'scale(1)',
                          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        <div style={{ transform: `scale(${cardScale})`, transformOrigin: 'top left' }}>
                          {isUnlocked ? (
                            <DoorCard
                              day={day}
                              isUnlocked={isUnlocked}
                              isCompleted={isCompleted}
                              isToday={isToday}
                              onClick={(e) => handleDoorClick(day.day, e)}
                            />
                          ) : (
                            <LockedDoorCard day={day} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Loading індикатор для карток що завантажуються */}
                  {isMobile && cardsToRender < 24 && (
                    <div 
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 px-4 py-2 rounded-full shadow-lg"
                      style={{ color: '#052311' }}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#CE2E2E', borderTopColor: 'transparent' }} />
                        Завантаження {cardsToRender}/24
                      </div>
                    </div>
                  )}
                </div>
              </TransformComponent>
            );
          }}
        </TransformWrapper>
      </div>

      {/* Helper text - Fixed at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-40 py-3 text-center text-sm opacity-60 bg-white/60 backdrop-blur-sm transition-opacity duration-300" 
        style={{ 
          color: '#052311',
          opacity: hideCalendar ? 0 : 0.6,
          pointerEvents: hideCalendar ? 'none' : 'auto'
        }}
      >
        Використовуйте колесо миші для масштабування • Перетягуйте мишею для переміщення • Подвійне натискання для зуму
      </div>

      {/* 3D Door Opening Animation */}
      {openingDay !== null && (
        <DoorOpeningAnimation
          day={calendarDays.find(d => d.day === openingDay)!}
          onComplete={handleDoorAnimationComplete}
        />
      )}
    </div>
  );
}