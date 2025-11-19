import { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ChevronLeft, ZoomIn, ZoomOut, Maximize2, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { calendarDays } from '../data/calendarData';
import { DoorCard } from './DoorCard';

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
}

const CANVAS_WIDTH = 5100;
const CANVAS_HEIGHT = 6540;
const MOBILE_SCALE = 0.33; // Приблизно втричі менше для мобільних

export function CalendarView({ completedDays, onDayClick, onBackToHome, userProfile, onSignOut, onAdminClick }: CalendarViewProps) {
  const [openingDay, setOpeningDay] = useState<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const transformFunctionsRef = useRef<any>(null);
  const mouseDownPos = useRef<{ x: number; y: number; time: number } | null>(null);

  // Визначаємо чи це мобільний пристрій
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Розміри canvas в залежності від пристрою
  const canvasWidth = isMobile ? CANVAS_WIDTH * MOBILE_SCALE : CANVAS_WIDTH - 300;
  const canvasHeight = isMobile ? CANVAS_HEIGHT * MOBILE_SCALE : CANVAS_HEIGHT + 830;
  const cardScale = isMobile ? MOBILE_SCALE : 1;

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const isDecember = currentMonth === 11;

  const isDayUnlocked = (day: number) => {
    // For demo purposes, unlock all days
    return true;
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
    
    setOpeningDay(day);
    setTimeout(() => {
      onDayClick(day);
      setOpeningDay(null);
    }, 600);
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
      case 'premium': return 'Чудо';
      default: return tier;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: '#e8e4e1', zIndex: 9999 }}>
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b" style={{ borderColor: '#05231120' }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBackToHome}
                className="hover:bg-[#052311]/10"
                style={{ color: '#052311' }}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                На головну
              </Button>
              
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
        </div>
      </div>

      {/* Zoom Controls - Fixed */}
      <div className="absolute top-20 right-4 z-40">
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
      <div className="absolute inset-0 w-screen h-screen pt-[60px]">
        <TransformWrapper
          initialScale={isMobile ? 0.8 : 0.38}
          minScale={0.05}
          maxScale={1.0}
          centerOnInit={false}
          initialPositionX={isMobile ? 10 : -150}
          initialPositionY={isMobile ? 80 : 90}
          limitToBounds={true}
          minPositionX={typeof window !== 'undefined' ? window.innerWidth - (canvasWidth * (isMobile ? 0.8 : 0.38)) - 50 : -3000}
          maxPositionX={isMobile ? 10 : 0}
          minPositionY={typeof window !== 'undefined' ? window.innerHeight - (canvasHeight * (isMobile ? 0.8 : 0.38)) - (isMobile ? 100 : 100) : -3000}
          maxPositionY={isMobile ? 80 : 90}
          disablePadding={true}
          wheel={{ 
            step: 0.08,
            smoothStep: 0.005
          }}
          doubleClick={{ disabled: false, step: 0.5 }}
          panning={{ 
            disabled: false,
            velocityDisabled: false
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
                  {calendarDays.map((day) => {
                    const isUnlocked = isDayUnlocked(day.day);
                    const isCompleted = completedDays.has(day.day);
                    const isToday = isDecember && day.day === currentDay;
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
                          <DoorCard
                            day={day}
                            isUnlocked={isUnlocked}
                            isCompleted={isCompleted}
                            isToday={isToday}
                            onClick={(e) => handleDoorClick(day.day, e)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TransformComponent>
            );
          }}
        </TransformWrapper>
      </div>

      {/* Helper text - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-40 py-3 text-center text-sm opacity-60 bg-white/60 backdrop-blur-sm" style={{ color: '#052311' }}>
        Використовуйте колесо миші для масштабування • Перетягуйте мишею для переміщення • Подвійне натискання для зуму
      </div>
    </div>
  );
}