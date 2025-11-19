import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Download, Check, ExternalLink, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { getDayContent } from '../data/calendarData';
import ChristmasTree from '../imports/Frame48097540';
import ChristmasBalls from '../imports/Frame48097541';
import CandyCane from '../imports/Vector';
import SnowflakeIcon from '../imports/Frame48097537';
import GiftsWithDecor from '../imports/Vector-43-1850';
import videoThumbnail from 'figma:asset/31ac8b75443715bd6f9bdee4211e28496b8bc0fb.png';

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
  const content = getDayContent(day);
  const progress = (totalCompleted / 24) * 100;

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="hover:bg-[#2d5a3d]/10"
              style={{ color: '#2d5a3d' }}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              До календаря
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#1e3a5f' }}>
                <span>Прогрес:</span>
                <span>{totalCompleted}/24</span>
              </div>
              <Progress value={progress} className="w-32 h-3" style={{ backgroundColor: '#2d5a3d20' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Day Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 rounded-full backdrop-blur-sm border-2" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
              <span className="text-sm" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>День {day} з 24</span>
            </div>

            <h1 
              className="text-4xl md:text-5xl lg:text-[60px] leading-tight" 
              style={{ 
                color: '#2d5a3d',
                fontFamily: "'Dela Gothic One', sans-serif",
                letterSpacing: '-2px'
              }}
            >
              {content.title}
            </h1>

            <p className="text-xl md:text-2xl lg:text-[24px] max-w-2xl mx-auto leading-relaxed" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              {content.description}
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Badge variant="secondary" className="text-lg px-4 py-2" style={{ backgroundColor: 'rgba(45,90,61,0.13)', color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>
                {content.theme}
              </Badge>
              {isCompleted && (
                <Badge className="text-lg px-4 py-2" style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1', fontFamily: 'Arial, sans-serif' }}>
                  <Check className="w-4 h-4 mr-1" />
                  Виконано
                </Badge>
              )}
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 mb-8" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(45,90,61,0.13)' }}>
                <Play className="w-6 h-6" style={{ color: '#2d5a3d' }} />
              </div>
              <h2 className="text-2xl md:text-3xl" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>Вступ експерта</h2>
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
                  <div className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Play className="w-10 h-10 ml-1" style={{ color: '#2d5a3d' }} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>Відео від {content.expert}</p>
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

            <p className="mt-4 text-base md:text-lg" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              Сьогодні ти дізнаєшся, як {content.description.toLowerCase()}
            </p>
          </div>

          {/* Practice Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 mb-8" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <h2 className="text-2xl md:text-3xl mb-6" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>Практична частина</h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-line text-base md:text-lg" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                {content.practice}
              </p>
            </div>

            <div className="flex gap-4 mt-8 flex-wrap">
              <Button
                variant="outline"
                className="border-2 hover:bg-[#2d5a3d]/10"
                style={{ borderColor: '#2d5a3d', color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Завантажити PDF
              </Button>
              <Button
                variant="outline"
                className="border-2 hover:bg-[#2d5a3d]/10"
                style={{ borderColor: '#2d5a3d', color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Аудіо-медитація
              </Button>
            </div>
          </div>

          {/* Expert Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 mb-8" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            <h3 className="text-2xl md:text-3xl mb-6" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>Експерт дня {day}</h3>
            <div className="flex items-start gap-6 flex-col sm:flex-row">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl flex-shrink-0" style={{ backgroundColor: '#2d5a3d' }}>
                {content.expert.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl mb-2" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>{content.expert}</h3>
                <p className="mb-4 text-base md:text-lg" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                  {content.expertBio}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm md:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                    <ExternalLink className="w-4 h-4" style={{ color: '#2d5a3d' }} />
                    <span>Instagram: @{content.expert.toLowerCase().replace(/\s+/g, '_')}</span>
                  </div>
                  
                  {content.bonus && (
                    <div className="rounded-xl p-4 border-2" style={{ backgroundColor: 'rgba(45,90,61,0.1)', borderColor: 'rgba(45,90,61,0.13)' }}>
                      <p className="text-sm md:text-base" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                        <span style={{ color: '#d94a4a' }}>🎁 Бонус:</span> {content.bonus}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 text-center" style={{ borderColor: 'rgba(45,90,61,0.13)' }}>
            {!isCompleted ? (
              <>
                <p className="text-lg md:text-xl mb-6" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                  Виконали практику? Відмітьте день як завершений
                </p>
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="px-12 py-7 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1', fontFamily: 'Arial, sans-serif' }}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Завершити день {day}
                </Button>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-4" style={{ backgroundColor: 'rgba(45,90,61,0.1)' }}>
                  <Check className="w-6 h-6" style={{ color: '#2d5a3d' }} />
                  <span style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>День завершено!</span>
                </div>
                <p style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
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