import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Download, Check, ExternalLink, Play, Instagram, Send, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { getDayContent } from '../data/calendarData';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { TierContent } from '../types/contentBlocks';
import { ExpertData, ThemeData } from '../types/dayData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ChristmasTree from '../imports/Frame48097540';
import ChristmasBalls from '../imports/Frame48097541';
import CandyCane from '../imports/Vector';
import SnowflakeIcon from '../imports/Frame48097537';
import GiftsWithDecor from '../imports/Vector-43-1850';
import videoThumbnail from 'figma:asset/15afe6d90c9855a1b180d52034866bebf72dbec5.png';
import expertPhoto from 'figma:asset/696fcc0958de0b7487d0875ec399a9df109e32f1.png';

interface DayContentProps {
  day: number;
  isCompleted: boolean;
  onComplete: (day: number) => void;
  onBack: () => void;
  totalCompleted: number;
  userTier?: 'basic' | 'deep' | 'premium';
}

// Конвертуємо GitHub blob URL в raw URL для прямого завантаження зображень
const convertGitHubUrl = (url: string) => {
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }
  return url;
};

export function DayContent({ day, isCompleted, onComplete, onBack, totalCompleted, userTier }: DayContentProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [dynamicContent, setDynamicContent] = useState<TierContent | null>(null);
  const [dynamicExpert, setDynamicExpert] = useState<ExpertData | null>(null);
  const [dynamicTheme, setDynamicTheme] = useState<ThemeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSnow, setShowSnow] = useState(true);
  const [isDayAccessible, setIsDayAccessible] = useState<boolean | null>(null);
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const content = getDayContent(day);
  const progress = (totalCompleted / 24) * 100;

  // Функція генерації PDF з контенту сторінки
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    
    try {
      console.log('Starting visual PDF generation with html2canvas...');
      
      // Створюємо PDF документ A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // ======= ТИТУЛЬНА СТОРІНКА =======
      // Створюємо градієнт фон
      const gradientSteps = 50;
      const colorStart = { r: 45, g: 90, b: 61 }; // #2d5a3d
      const colorEnd = { r: 206, g: 46, b: 46 }; // #CE2E2E
      
      for (let i = 0; i < gradientSteps; i++) {
        const ratio = i / gradientSteps;
        const r = Math.round(colorStart.r + (colorEnd.r - colorStart.r) * ratio);
        const g = Math.round(colorStart.g + (colorEnd.g - colorStart.g) * ratio);
        const b = Math.round(colorStart.b + (colorEnd.b - colorStart.b) * ratio);
        
        pdf.setFillColor(r, g, b);
        const rectHeight = pageHeight / gradientSteps;
        pdf.rect(0, i * rectHeight, pageWidth, rectHeight, 'F');
      }
      
      // Додаємо напівпрозорий білий оверлей для кращої читабельності
      pdf.setFillColor(255, 255, 255);
      pdf.setGState(new pdf.GState({ opacity: 0.15 }));
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setGState(new pdf.GState({ opacity: 1 }));
      
      // Заголовок
      pdf.setFontSize(32);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      const titleText = '24 кроки до нового себе';
      pdf.text(titleText, pageWidth / 2, 80, { align: 'center' });
      
      // День
      pdf.setFontSize(48);
      pdf.text(`День ${day}`, pageWidth / 2, 110, { align: 'center' });
      
      // Назва дня
      const title = dynamicTheme?.title || content.title;
      pdf.setFontSize(22);
      const titleLines = pdf.splitTextToSize(title, pageWidth - 40);
      let titleY = 140;
      titleLines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, titleY, { align: 'center' });
        titleY += 10;
      });
      
      // Підзаголовок
      const subtitle = dynamicTheme?.subtitle || content.subtitle;
      if (subtitle) {
        pdf.setFontSize(16);
        const subtitleLines = pdf.splitTextToSize(subtitle, pageWidth - 40);
        let subtitleY = titleY + 15;
        subtitleLines.forEach((line: string) => {
          pdf.text(line, pageWidth / 2, subtitleY, { align: 'center' });
          subtitleY += 8;
        });
      }
      
      // Футер титульної сторінки
      pdf.setFontSize(12);
      pdf.text(`Дата створення: ${new Date().toLocaleDateString('uk-UA')}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
      
      // ======= СТОРІНКИ КОНТЕНТУ =======
      // Знаходимо контейнер з контентом для захоплення
      const originalContainer = document.querySelector('.day-content-container') as HTMLElement;
      
      if (!originalContainer) {
        throw new Error('Контент не знайдено');
      }
      
      // Створюємо клон контейнера, щоб не чіпати оригінальний DOM
      const clonedContainer = originalContainer.cloneNode(true) as HTMLElement;
      
      // Додаємо клон в body, але поза екраном
      clonedContainer.style.position = 'absolute';
      clonedContainer.style.left = '-9999px';
      clonedContainer.style.top = '0';
      clonedContainer.style.width = `${originalContainer.offsetWidth}px`;
      document.body.appendChild(clonedContainer);
      
      let canvas: HTMLCanvasElement;
      
      try {
        // Функція для конвертації oklch/oklab в hex
        const convertColorToHex = (colorStr: string): string => {
          if (!colorStr || colorStr === 'transparent') return colorStr;
          
          // Якщо це oklch або oklab - замінюємо на безпечні кольори
          if (colorStr.includes('oklch') || colorStr.includes('oklab')) {
            // Визначаємо по контексту який колір потрібен
            if (colorStr.includes('0.95') || colorStr.includes('0.9')) {
              return '#ffffff'; // світлі кольори
            } else if (colorStr.includes('0.2') || colorStr.includes('0.3')) {
              return '#2d5a3d'; // темні зелені
            } else if (colorStr.includes('0.4') || colorStr.includes('0.5')) {
              return '#1e3a5f'; // темно-сині
            }
            return '#e8e4e1'; // дефолтний бежевий
          }
          
          // Якщо це вже hex, rgb, або інший підтримуваний формат - залишаємо як є
          return colorStr;
        };
        
        // Рекурсивно копіюємо computed styles як inline styles
        const copyComputedStylesToInline = (element: HTMLElement) => {
          const computedStyle = window.getComputedStyle(element);
          
          // Копіюємо тільки важливі стилі, замінюючи oklch на безпечні кольори
          const importantStyles = [
            'color',
            'backgroundColor', 
            'borderColor',
            'borderTopColor',
            'borderRightColor',
            'borderBottomColor',
            'borderLeftColor',
            'outlineColor',
            'fill',
            'stroke'
          ];
          
          importantStyles.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value) {
              const convertedValue = convertColorToHex(value);
              element.style.setProperty(prop, convertedValue, 'important');
            }
          });
          
          // Рекурсивно обробляємо дочірні елементи
          Array.from(element.children).forEach(child => {
            copyComputedStylesToInline(child as HTMLElement);
          });
        };
        
        copyComputedStylesToInline(clonedContainer);
        
        // Видаляємо iframe та video з клону
        clonedContainer.querySelectorAll('iframe, video').forEach(el => el.remove());
        
        // Захоплюємо клон як зображення
        canvas = await html2canvas(clonedContainer, {
          scale: 2, // Висока якість
          useCORS: true,
          logging: false,
          backgroundColor: '#f5f1ee',
          windowWidth: clonedContainer.scrollWidth,
          windowHeight: clonedContainer.scrollHeight,
        });
      } finally {
        // Завжди видаляємо клон з DOM, навіть якщо виникла помилка
        if (document.body.contains(clonedContainer)) {
          document.body.removeChild(clonedContainer);
        }
      }
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      // Розраховуємо розміри для PDF
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Розбиваємо на сторінки
      const pageContentHeight = pageHeight - (margin * 2);
      let heightLeft = imgHeight;
      let position = 0;
      
      // Додаємо першу сторінку контенту
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageContentHeight;
      
      // Додаємо наступні сторінки, якщо контент не вміщується
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position + margin, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageContentHeight;
      }

      // Створюємо безпечну назву файлу (видаляємо спеціальні символи)
      const safeTitle = (dynamicTheme?.title || content.title)
        .replace(/[^a-zA-Z0-9а-яА-ЯіІїЇєЄґҐ\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50); // обмежуємо довжину
      
      const fileName = `День_${day}_${safeTitle}.pdf`;
      
      console.log('Saving visual PDF:', fileName);
      pdf.save(fileName);
      
      console.log('Visual PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Помилка при генерації PDF: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Перевірка доступності дня через бекенд
  useEffect(() => {
    const checkDayAccess = async () => {
      try {
        const accessToken = localStorage.getItem('advent_access_token');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/check-day/${day}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsDayAccessible(data.accessible);
        } else {
          setIsDayAccessible(false);
        }
      } catch (error) {
        console.error('Error checking day access:', error);
        setIsDayAccessible(false);
      } finally {
        setAccessCheckLoading(false);
      }
    };

    checkDayAccess();
  }, [day]);

  // Контролюємо загрузку та анімацію входу
  useEffect(() => {
    setIsLoading(true);
    setShowSnow(true);
    
    // Білий фон зникає швидко
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    // Сніг зникає через 3 секунди після розчинення білого фону
    const snowTimer = setTimeout(() => {
      setShowSnow(false);
    }, 100 + 800 + 3000); // завантаження + розчинення білого + 3 сек снігу = 3900ms
    
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(snowTimer);
    };
  }, [day]);

  // Завантажуємо динамічний контент з бази даних
  useEffect(() => {
    const loadDynamicContent = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/content/day/${day}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Loaded dynamic content for day', day, ':', data);
          if (data.content) {
            setDynamicContent(data.content);
          }
        }
      } catch (error) {
        console.error('Error loading dynamic content:', error);
      }
    };

    const loadDynamicExpert = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/content/day/${day}/expert`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Loaded dynamic expert for day', day, ':', data);
          if (data.expert) {
            console.log('Expert photo URL:', data.expert.photoUrl);
            console.log('Expert social:', data.expert.social);
            console.log('Expert Instagram:', data.expert.social?.instagram);
            setDynamicExpert(data.expert);
          }
        } else {
          console.error('Failed to load expert, status:', response.status);
        }
      } catch (error) {
        console.error('Error loading dynamic expert:', error);
      }
    };

    const loadDynamicTheme = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/content/day/${day}/theme`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Loaded dynamic theme for day', day, ':', data);
          if (data.theme) {
            console.log('Theme videoUrl:', data.theme.videoUrl);
            console.log('Theme videoThumbnail:', data.theme.videoThumbnail);
            console.log('Theme bonus:', data.theme.bonus);
            setDynamicTheme(data.theme);
          }
        }
      } catch (error) {
        console.error('Error loading dynamic theme:', error);
      }
    };

    loadDynamicContent();
    loadDynamicExpert();
    loadDynamicTheme();
  }, [day]);

  const handleComplete = () => {
    onComplete(day);
  };

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(dynamicTheme?.videoUrl || content.videoUrl);
  
  // Конвертуємо обкладинку з GitHub blob в raw URL якщо потрібно
  const thumbnailUrl = convertGitHubUrl(dynamicTheme?.videoThumbnail || content.videoThumbnail || videoThumbnail);
  
  // Логування для діагностики відео
  console.log('Video URL source:', dynamicTheme?.videoUrl ? 'dynamic' : 'static');
  console.log('Video URL:', dynamicTheme?.videoUrl || content.videoUrl);
  console.log('Embed URL:', embedUrl);
  console.log('Video thumbnail (original):', dynamicTheme?.videoThumbnail || content.videoThumbnail);
  console.log('Video thumbnail (converted):', thumbnailUrl);

  // Check for special badges
  const badges = []
  if (totalCompleted >= 6) badges.push({ name: 'Воїн тіла', color: '#2d5a3d' });
  if (totalCompleted >= 12) badges.push({ name: 'Майстер емоцій', color: '#d94a4a' });
  if (totalCompleted >= 18) badges.push({ name: 'Захисник кордонів', color: '#e6963a' });
  if (totalCompleted === 24) badges.push({ name: 'Трансформація завершена', color: '#1e3a5f' });

  // Показуємо loader поки перевіряємо доступність
  if (accessCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#e8e4e1' }}>
        <div className="text-xl" style={{ color: '#2d5a3d' }}>Завантаження...</div>
      </div>
    );
  }

  // Якщо день заблокований - показуємо overlay
  if (isDayAccessible === false) {
    return (
      <>
        {/* Основний контент під overlay (приховано) */}
        <div className="min-h-screen" style={{ backgroundColor: '#e8e4e1', display: 'none' }}>
          {/* Контент прихований */}
        </div>

        {/* Overlay для заблокованого дня */}
        <div 
          className="overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(232, 228, 225, 0.98)',
            pointerEvents: 'auto',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="text-center px-4 py-8 max-w-md mx-auto">
            {/* Іконка замка */}
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(45, 90, 61, 0.1)' }}
            >
              <Lock className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#2d5a3d' }} />
            </div>

            {/* Заголовок */}
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl mb-4"
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif"
              }}
            >
              Упс, день ще закритий
            </h2>

            {/* Опис */}
            <p 
              className="text-base sm:text-lg mb-8"
              style={{ 
                color: '#1e3a5f',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              Цей день буде доступний пізніше. Завершіть попередні дні, щоб відкрити його!
            </p>

            {/* Кнопка повернутись */}
            <Button
              onClick={onBack}
              size="lg"
              className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ 
                backgroundColor: '#2d5a3d',
                color: '#e8e4e1',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Повернутись до календаря
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#e8e4e1' }}>
      {/* Білий оверлей що розсіюється */}
      <motion.div
        className="fixed inset-0 z-[60]"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 1)',
          pointerEvents: isLoading ? 'auto' : 'none',
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut', delay: 0 }}
      />

      {/* Падаючий сніг - окремий шар, який залишається після розчинення білого фону */}
      <AnimatePresence>
        {showSnow && (
          <motion.div 
            className="fixed inset-0 z-[55] pointer-events-none overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Падаючі сніжинки - світло блакитні/сіруваті */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ 
                  y: ['0vh', '110vh'],
                  opacity: [0, 0.7, 0.7, 0],
                  x: [0, Math.sin(i) * 50, Math.sin(i) * -50, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
              >
                <div 
                  className="rounded-full"
                  style={{ 
                    width: '4px',
                    height: '4px',
                    backgroundColor: i % 3 === 0 ? '#a8c5dd' : i % 3 === 1 ? '#b0bec5' : '#9eb8cf',
                    opacity: 0.6,
                    boxShadow: `0 0 8px ${i % 3 === 0 ? 'rgba(168,197,221,0.6)' : i % 3 === 1 ? 'rgba(176,190,197,0.6)' : 'rgba(158,184,207,0.6)'}`
                  }}
                />
              </motion.div>
            ))}

            {/* Світлі блискітки що летять зверху */}
            {[...Array(12)].map((_, i) => {
              const startX = 10 + Math.random() * 80; // 10-90% ширини екрану
              return (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute"
                  style={{
                    left: `${startX}%`,
                    top: '-10px',
                  }}
                  initial={{ 
                    y: -10,
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    scale: [0, 1, 1, 0.5, 0],
                    opacity: [0, 0.8, 0.8, 0.4, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3, // Заповільнено: 4-7 секунд
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "linear"
                  }}
                >
                  <div 
                    className="relative"
                    style={{ 
                      width: '6px',
                      height: '6px',
                    }}
                  >
                    {/* Хрестик блискітки */}
                    <div 
                      className="absolute"
                      style={{ 
                        width: '6px',
                        height: '1.5px',
                        backgroundColor: '#ffffff',
                        left: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 0 8px rgba(255,255,255,0.9)'
                      }}
                    />
                    <div 
                      className="absolute"
                      style={{ 
                        width: '1.5px',
                        height: '6px',
                        backgroundColor: '#ffffff',
                        left: '50%',
                        top: '0',
                        transform: 'translateX(-50%)',
                        boxShadow: '0 0 8px rgba(255,255,255,0.9)'
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
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

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-2" style={{ borderColor: '#2d5a3d20' }}>
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={onBack}
              className="hover:bg-[#2d5a3d]/10 text-xs sm:text-sm px-2 sm:px-4"
              style={{ color: '#2d5a3d' }}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">До календаря</span>
            </Button>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm" style={{ color: '#1e3a5f' }}>
                <span className="hidden sm:inline">Прогрес:</span>
                <span>{totalCompleted}/24</span>
              </div>
              <Progress value={progress} className="w-16 sm:w-32 h-2 sm:h-3" style={{ backgroundColor: '#2d5a3d20' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-4xl day-content-container">
        <div>
          {/* Day Header */}
          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/70 rounded-full backdrop-blur-sm border-2" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
              <span className="text-xs sm:text-sm" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>День {day} з 24</span>
            </div>

            <h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] leading-tight px-2 break-words" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-1px'
              }}
            >
              {dynamicTheme?.title || content.title}
            </h1>

            <p className="text-base sm:text-lg md:text-2xl max-w-2xl mx-auto px-2 break-words" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
              {dynamicTheme?.subtitle || content.subtitle}
            </p>

            <p className="text-sm sm:text-base md:text-lg lg:text-[18px] max-w-2xl mx-auto leading-relaxed px-2 break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              {dynamicTheme?.description || content.description}
            </p>

            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-2">
              <Badge variant="secondary" className="text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1.5 sm:py-2 break-words" style={{ backgroundColor: 'rgba(45,90,61,0.13)', color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>
                {dynamicTheme?.theme || content.theme}
              </Badge>
              {isCompleted && (
                <Badge className="text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1.5 sm:py-2" style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1', fontFamily: 'Arial, sans-serif' }}>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Виконано
                </Badge>
              )}
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 mb-6 sm:mb-8" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(45,90,61,0.13)' }}>
                <Play className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#2d5a3d' }} />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl break-words" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>Вступ експерта</h2>
            </div>

            <div className="relative w-full aspect-video">
              {!showVideo ? (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden group cursor-pointer border-2 z-10"
                  style={{ 
                    borderColor: '#2d5a3d30',
                    backgroundImage: `url(${thumbnailUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                      <Play className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 ml-1" style={{ color: '#2d5a3d' }} />
                    </div>
                  </div>
                </button>
              ) : null}
              
              <div className="w-full h-full rounded-2xl overflow-hidden bg-black border-2" style={{ borderColor: '#2d5a3d30' }}>
                {embedUrl ? (
                  <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#2d5a3d10' }}>
                    <p style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>Тут буде відео від експерта</p>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              {content.description.toLowerCase()}
            </p>
          </div>

          {/* Practice Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 mb-6 sm:mb-8" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6 break-words" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>Практична частина</h2>
            
            {/* Визначаємо які блоки показувати на основі тарифу */}
            {(() => {
              let blocksToShow = dynamicContent?.basic || [];
              
              if (userTier === 'premium' && dynamicContent?.premium && dynamicContent.premium.length > 0) {
                blocksToShow = dynamicContent.premium;
              } else if (userTier === 'deep' && dynamicContent?.deep && dynamicContent.deep.length > 0) {
                blocksToShow = dynamicContent.deep;
              } else if (dynamicContent?.basic && dynamicContent.basic.length > 0) {
                blocksToShow = dynamicContent.basic;
              }
              
              console.log(`Day ${day} - userTier:`, userTier, '- blocksToShow length:', blocksToShow.length);
              
              // Якщо є динамічний контент з блоками - показуємо його
              if (blocksToShow.length > 0) {
                return <ContentBlockRenderer blocks={blocksToShow} />;
              }
              
              // Fallback на статичний текст
              return (
                <div className="prose prose-lg max-w-none">
                  <p className="whitespace-pre-line text-sm sm:text-base md:text-lg break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                    {(userTier === 'deep' || userTier === 'premium') && content.practiceDeep ? content.practiceDeep : content.practice}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Expert Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 mb-6 sm:mb-8" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6 break-words" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>Експерт дня {day}</h3>
            <div className="flex items-start gap-4 sm:gap-6 flex-col sm:flex-row">
              {(() => {
                const photoUrl = dynamicExpert?.photoUrl ? convertGitHubUrl(dynamicExpert.photoUrl) : null;
                console.log('Original photoUrl:', dynamicExpert?.photoUrl);
                console.log('Converted photoUrl:', photoUrl);
                
                return photoUrl ? (
                  <ImageWithFallback
                    src={photoUrl} 
                    alt={dynamicExpert?.name || content.expert}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0 border-2"
                    style={{ borderColor: '#2d5a3d' }}
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl flex-shrink-0" style={{ backgroundColor: '#2d5a3d' }}>
                    {(dynamicExpert?.name || content.expert).charAt(0)}
                  </div>
                );
              })()}
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl mb-2 break-words" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>{dynamicExpert?.name || content.expert}</h3>
                
                {/* Напрямок діяльності */}
                {(dynamicExpert?.role || content.expertRole) && (
                  <p className="mb-3 text-sm sm:text-base md:text-lg break-words whitespace-pre-line" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                    {dynamicExpert?.role || content.expertRole}
                  </p>
                )}
                
                {/* Про експерта */}
                <p className="mb-4 text-xs sm:text-sm md:text-base whitespace-pre-line break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                  {dynamicExpert?.bio || content.expertBio}
                </p>
                
                <div className="space-y-2 sm:space-y-3">
                  {(dynamicExpert?.social?.instagram || content.expertSocial?.instagram) && (
                    <a 
                      href={dynamicExpert?.social?.instagram || content.expertSocial?.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs sm:text-sm md:text-base hover:underline break-all" 
                      style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
                    >
                      <Instagram className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#2d5a3d' }} />
                      <span>Instagram</span>
                    </a>
                  )}
                  
                  {(dynamicExpert?.social?.telegram || content.expertSocial?.telegram) && (
                    <a 
                      href={dynamicExpert?.social?.telegram || content.expertSocial?.telegram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs sm:text-sm md:text-base hover:underline break-all" 
                      style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#2d5a3d' }} />
                      <span>Telegram</span>
                    </a>
                  )}
                  
                  {(dynamicExpert?.social?.website || content.expertSocial?.website) && (
                    <a 
                      href={dynamicExpert?.social?.website || content.expertSocial?.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs sm:text-sm md:text-base hover:underline break-all" 
                      style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#2d5a3d' }} />
                      <span>Портфоліо / Сайт</span>
                    </a>
                  )}
                </div>
                
                {/* Бонус від експерта - завжди видимий якщо є */}
                {((dynamicTheme?.bonus && dynamicTheme.bonus.trim()) || (content.bonus && content.bonus.trim())) && (
                  <div className="rounded-xl p-3 sm:p-4 border-2 mt-3 sm:mt-4" style={{ backgroundColor: 'rgba(45,90,61,0.1)', borderColor: 'rgba(45,90,61,0.13)' }}>
                    <p className="text-xs sm:text-sm md:text-base whitespace-pre-line break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                      {dynamicTheme?.bonus || content.bonus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 text-center" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            {!isCompleted ? (
              <>
                <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 px-2 break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                  Виконали практику? Відмітьте день як завершений
                </p>
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 text-base sm:text-lg md:text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1', fontFamily: 'Arial, sans-serif' }}
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="break-words">Завершити день {day}</span>
                </Button>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-3 sm:mb-4" style={{ backgroundColor: 'rgba(45,90,61,0.1)' }}>
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" style={{ color: '#2d5a3d' }} />
                  <span className="text-sm sm:text-base break-words" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>День завершено!</span>
                </div>
                <p className="text-sm sm:text-base break-words px-2" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                  Чудово! Повертайтесь завтра за новою практикою
                </p>
              </>
            )}
          </div>

          {/* Badges Section */}
          {badges.length > 0 && (
            <div
              className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2"
              style={{ borderColor: '#d94a4a30' }}
            >
              <h3 className="text-2xl mb-4 text-center" style={{ color: '#2d5a3d' }}>🏆 Ваші досягнення</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md border-2"
                    style={{ borderColor: badge.color + '30' }}
                  >
                    <span className="text-lg" style={{ color: badge.color }}>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}