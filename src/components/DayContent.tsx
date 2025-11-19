import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Download, Check, ExternalLink, Play, Instagram, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { getDayContent } from '../data/calendarData';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { TierContent } from '../types/contentBlocks';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';
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

export function DayContent({ day, isCompleted, onComplete, onBack, totalCompleted, userTier }: DayContentProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [dynamicContent, setDynamicContent] = useState<TierContent | null>(null);
  const content = getDayContent(day);
  const progress = (totalCompleted / 24) * 100;

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

    loadDynamicContent();
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

  const embedUrl = getYouTubeEmbedUrl(content.videoUrl);

  // Check for special badges
  const badges = [];
  if (totalCompleted >= 6) badges.push({ name: 'Воїн тіла', color: '#2d5a3d' });
  if (totalCompleted >= 12) badges.push({ name: 'Майстер емоцій', color: '#d94a4a' });
  if (totalCompleted >= 18) badges.push({ name: 'Захисник кордонів', color: '#e6963a' });
  if (totalCompleted === 24) badges.push({ name: 'Трансформація завершена', color: '#1e3a5f' });

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
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
              {content.title}
            </h1>

            <p className="text-base sm:text-lg md:text-2xl max-w-2xl mx-auto px-2 break-words" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
              {content.subtitle}
            </p>

            <p className="text-sm sm:text-base md:text-lg lg:text-[18px] max-w-2xl mx-auto leading-relaxed px-2 break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              {content.description}
            </p>

            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-2">
              <Badge variant="secondary" className="text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1.5 sm:py-2 break-words" style={{ backgroundColor: 'rgba(45,90,61,0.13)', color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>
                {content.theme}
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

            {!showVideo ? (
              <button
                onClick={() => setShowVideo(true)}
                className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer border-2"
                style={{ 
                  borderColor: '#2d5a3d30',
                  backgroundImage: `url(${videoThumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Play className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 ml-1" style={{ color: '#2d5a3d' }} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-sm sm:text-base md:text-lg break-words" style={{ fontFamily: 'Arial, sans-serif' }}>Відео від {content.expert}</p>
                </div>
              </button>
            ) : (
              <div className="aspect-video rounded-2xl overflow-hidden bg-black" style={{ borderColor: '#2d5a3d30' }}>
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
            )}

            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Сьогодні ти {content.description.toLowerCase()}
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

            <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
              {userTier === 'premium' && (
                <Button
                  variant="outline"
                  className="border-2 hover:bg-[#2d5a3d]/10 text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2 break-words"
                  style={{ borderColor: '#2d5a3d', color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span>Завантажити PDF</span>
                </Button>
              )}
            </div>
          </div>

          {/* Expert Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 mb-6 sm:mb-8" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6 break-words" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>Експерт дня {day}</h3>
            <div className="flex items-start gap-4 sm:gap-6 flex-col sm:flex-row">
              {day === 1 ? (
                <ImageWithFallback
                  src={expertPhoto} 
                  alt={content.expert}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0 border-2"
                  style={{ borderColor: '#2d5a3d' }}
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl flex-shrink-0" style={{ backgroundColor: '#2d5a3d' }}>
                  {content.expert.charAt(0)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl mb-2 break-words" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>{content.expert}</h3>
                
                {/* Напрямок діяльності */}
                {content.expertRole && (
                  <p className="mb-3 text-sm sm:text-base md:text-lg break-words whitespace-pre-line" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                    {content.expertRole}
                  </p>
                )}
                
                {/* Про експерта */}
                <p className="mb-4 text-xs sm:text-sm md:text-base whitespace-pre-line break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                  {content.expertBio}
                </p>
                
                <div className="space-y-2 sm:space-y-3">
                  {content.expertSocial?.instagram && (
                    <a 
                      href={content.expertSocial.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs sm:text-sm md:text-base hover:underline break-all" 
                      style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
                    >
                      <Instagram className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#2d5a3d' }} />
                      <span>Instagram</span>
                    </a>
                  )}
                  
                  {content.expertSocial?.telegram && (
                    <a 
                      href={content.expertSocial.telegram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs sm:text-sm md:text-base hover:underline break-all" 
                      style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#2d5a3d' }} />
                      <span>Telegram</span>
                    </a>
                  )}
                  
                  {content.expertSocial?.website && (
                    <a 
                      href={content.expertSocial.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs sm:text-sm md:text-base hover:underline break-all" 
                      style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#2d5a3d' }} />
                      <span>Портфоліо / Сайт</span>
                    </a>
                  )}
                  
                  {content.bonus && (
                    <div className="rounded-xl p-3 sm:p-4 border-2 mt-3 sm:mt-4" style={{ backgroundColor: 'rgba(45,90,61,0.1)', borderColor: 'rgba(45,90,61,0.13)' }}>
                      <p className="text-xs sm:text-sm md:text-base whitespace-pre-line break-words" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                        {content.bonus}
                      </p>
                    </div>
                  )}
                </div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2"
              style={{ borderColor: '#d94a4a30' }}
            >
              <h3 className="text-2xl mb-4 text-center" style={{ color: '#2d5a3d' }}>🏆 Ваші досягнення</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {badges.map((badge, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md border-2"
                    style={{ borderColor: badge.color + '30' }}
                  >
                    <span className="text-lg" style={{ color: badge.color }}>{badge.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}