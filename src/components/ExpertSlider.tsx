import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import svgPaths from '../imports/svg-xkdfbf7v25';
import { ImageWithFallback } from './figma/ImageWithFallback';
import chainImage from 'figma:asset/32d3aae18e013704c3f51f08ba2d63d2b2114ad7.png';

interface Expert {
  name: string;
  instagram: string;
  description: string;
  photo?: string; // Опціональне поле для фото
}

interface ExpertSliderProps {
  experts: Expert[];
}

// Компонент для новорічної кульки з експертом
function ChristmasOrnament({ expert, isCenter }: { expert: Expert; isCenter: boolean }) {
  // Розмір контейнера: збільшено для центральної кульки
  const containerWidth = isCenter ? 222 : 140;
  const containerHeight = isCenter ? 271 : 185;
  const ballSize = isCenter ? 222 : 140;
  
  // Колір підвіски: помаранчевий для центрального, бежевий для бокових
  const hangerColor = isCenter ? '#CF7A2C' : '#E8D5BF';
  
  return (
    <div 
      className="relative mx-auto transition-all duration-500 ease-out"
      style={{ 
        width: `${containerWidth}px`, 
        height: `${containerHeight}px`,
        opacity: isCenter ? 1 : 0.6,
        transform: isCenter ? 'scale(1)' : 'scale(0.82)'
      }}
    >
      {/* Підвіска зверху */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 top-0" 
        style={{ 
          width: isCenter ? '72px' : '45px',
          height: isCenter ? '85px' : '55px'
        }}
      >
        {/* Декоративний ланцюжок над підвіскою */}
        <div 
          className="absolute left-1/2 -translate-x-1/2" 
          style={{
            width: isCenter ? '26px' : '16px',
            height: isCenter ? '39px' : '24px',
            left: isCenter ? '-62px' : '-40px',
            top: isCenter ? '6px' : '5px'
          }}
        >
          <ImageWithFallback 
            src={chainImage} 
            alt="" 
            className="w-full h-full object-contain"
          />
        </div>

        <div 
          className="absolute bottom-0 overflow-hidden rounded-t-[20px]" 
          style={{
            left: '-100%',
            right: '0',
            top: '40%',
            width: '60%',
            transform: 'rotate(-30deg)',
            transformOrigin: 'top center'
          }}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 55">
            <g>
              <path d={svgPaths.p2aff4180} fill={hangerColor} opacity="0.9" />
              
            </g>
          </svg>
        </div>
      </div>

      {/* Основна кулька */}
      <div 
        className="absolute left-0" 
        style={{ 
          width: `${ballSize}px`, 
          height: `${ballSize}px`,
          bottom: '0.23%',
          right: '0.08%',
          top: isCenter ? '18.02%' : '20%'
        }}
      >
        {/* Базовий круг з першим inner shadow */}
        <div className="absolute inset-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 171 171">
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="177.768" id={`filter0_i_${expert.instagram}_1`} width="170.857" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="6.912" />
                <feGaussianBlur stdDeviation="14.4288" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0" />
                <feBlend in2="shape" mode="normal" result="effect1_innerShadow" />
              </filter>
            </defs>
            <g filter={`url(#filter0_i_${expert.instagram}_1)`} opacity="0.9">
              <path d={svgPaths.pc41480} fill="#12213E" />
            </g>
          </svg>
        </div>

        {/* Фото експерта всередині кульки */}
        <div 
          className="absolute blur-[0.173px] filter left-0 mix-blend-lighten overflow-clip rounded-full pointer-events-none"
          style={{
            width: `${ballSize}px`,
            height: `${ballSize}px`,
            top: '0'
          }}
        >
          {expert.photo ? (
            /* Якщо є фото - показуємо його */
            <div className="absolute left-[-0.53px] size-full top-[-0.24px]">
              <ImageWithFallback 
                src={expert.photo} 
                alt={expert.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          ) : (
            /* Якщо немає фото - показуємо placeholder з ініціалом */
            <div className="absolute left-[-0.53px] opacity-80 size-full top-[-0.24px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#b8c5d0] via-[#8a9aa8] to-[#5a6d7e]" />
              <div 
                className="absolute inset-0 flex items-center justify-center text-white"
                style={{ 
                  fontFamily: 'Arial, sans-serif', 
                  fontWeight: 'bold',
                  fontSize: isCenter ? '80px' : '64px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                {expert.name.charAt(0)}
              </div>
            </div>
          )}
          {/* Inner shadow на фото */}
          <div className="absolute inset-0 pointer-events-none shadow-[12.096px_5.184px_55.814px_0px_inset_#293751]" />
        </div>

        {/* Складні inner shadows для об'єму кульки */}
        <div className="absolute inset-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 171 171">
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="177.768" id={`filter0_iiii_${expert.instagram}_2`} width="177.769" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="6.912" />
                <feGaussianBlur stdDeviation="14.4288" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0" />
                <feBlend in2="shape" mode="normal" result="effect1_innerShadow" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="13.824" dy="12.096" />
                <feGaussianBlur stdDeviation="3.456" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.160784 0 0 0 0 0.215686 0 0 0 0 0.317647 0 0 0 0.5 0" />
                <feBlend in2="effect1_innerShadow" mode="normal" result="effect2_innerShadow" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="10.368" dy="3.456" />
                <feGaussianBlur stdDeviation="3.456" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0" />
                <feBlend in2="effect2_innerShadow" mode="normal" result="effect3_innerShadow" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="1.728" dy="6.912" />
                <feGaussianBlur stdDeviation="3.2832" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.100407 0 0 0 0 0.146034 0 0 0 0 0.230769 0 0 0 1 0" />
                <feBlend in2="effect3_innerShadow" mode="normal" result="effect4_innerShadow" />
              </filter>
            </defs>
            <g filter={`url(#filter0_iiii_${expert.instagram}_2)`} opacity="0.9">
              <path d={svgPaths.pc41480} fill="#12213E" fillOpacity="0.02" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function ExpertSlider({ experts }: ExpertSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? experts.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === experts.length - 1 ? 0 : prev + 1));
  };

  // Визначаємо які експерти показувати
  const getVisibleExperts = () => {
    const prev = currentIndex === 0 ? experts.length - 1 : currentIndex - 1;
    const next = currentIndex === experts.length - 1 ? 0 : currentIndex + 1;
    return [
      { expert: experts[prev], position: 'left' as const, key: `${prev}-left` },
      { expert: experts[currentIndex], position: 'center' as const, key: `${currentIndex}-center` },
      { expert: experts[next], position: 'right' as const, key: `${next}-right` },
    ];
  };

  const visibleExperts = getVisibleExperts();
  const currentExpert = experts[currentIndex];

  // Варіанти анімації для слайдів
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <div className="relative pt-4 pb-8 px-4">
      {/* Контейнер для кульок і кнопок з фіксованою висотою - збільшено для кривої */}
      <div className="relative h-[340px] sm:h-[380px] flex items-center justify-center">
        {/* Navigation Buttons - статичні */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-white/90 transition-all duration-300 flex items-center justify-center group shadow-lg"
          aria-label="Previous expert"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#1e3a5f] group-hover:text-[#2d5a3d]" strokeWidth={2.5} />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-white/90 transition-all duration-300 flex items-center justify-center group shadow-lg"
          aria-label="Next expert"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#1e3a5f] group-hover:text-[#2d5a3d]" strokeWidth={2.5} />
        </button>

        {/* Slider Container */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {/* Mobile: показуємо тільки центрального з анімацією */}
          <div className="sm:hidden relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 200, damping: 40 },
                  opacity: { duration: 0.5, ease: "easeInOut" },
                  scale: { duration: 0.5, ease: "easeInOut" }
                }}
                className="absolute"
              >
                <ChristmasOrnament expert={currentExpert} isCenter={true} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop/Tablet: показуємо 3 експерти по кривій (напівколо) */}
          <div className="hidden sm:flex items-center justify-center gap-6 md:gap-12 lg:gap-16 w-full relative">
            <AnimatePresence mode="popLayout" custom={direction}>
              {visibleExperts.map((item) => {
                // Визначаємо вертикальне зміщення для ефекту напівкола
                const verticalOffset = item.position === 'center' ? 0 : 60; // Бокові елементи нижче на 60px
                const scale = item.position === 'center' ? 1 : 0.85; // Бокові трохи менші
                
                return (
                  <motion.div
                    key={item.key}
                    custom={direction}
                    initial={{ 
                      opacity: 0, 
                      x: direction > 0 ? 150 : -150,
                      y: direction > 0 ? (item.position === 'right' ? verticalOffset : 0) : (item.position === 'left' ? verticalOffset : 0)
                    }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      y: verticalOffset,
                      scale: scale
                    }}
                    exit={{ 
                      opacity: 0, 
                      x: direction > 0 ? -150 : 150,
                      y: direction > 0 ? (item.position === 'left' ? verticalOffset : 0) : (item.position === 'right' ? verticalOffset : 0)
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 40,
                      opacity: { duration: 0.5, ease: "easeInOut" },
                      y: { type: "spring", stiffness: 200, damping: 40 },
                      scale: { duration: 0.4, ease: "easeOut" }
                    }}
                    className="flex-shrink-0"
                    onClick={() => {
                      if (item.position === 'left') goToPrevious();
                      if (item.position === 'right') goToNext();
                    }}
                    style={{ cursor: item.position !== 'center' ? 'pointer' : 'default' }}
                  >
                    <ChristmasOrnament 
                      expert={item.expert} 
                      isCenter={item.position === 'center'} 
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Center Expert Info */}
      {currentExpert && (
        <div className="mt-6 text-center space-y-2 max-w-md mx-auto px-4">
          <h4 
            className="text-xl sm:text-2xl" 
            style={{ 
              color: '#2d5a3d', 
              fontFamily: 'Arial, sans-serif', 
              fontWeight: 'bold' 
            }}
          >
            {currentExpert.name}
          </h4>
          <p 
            className="text-base sm:text-lg" 
            style={{ 
              color: '#1e3a5f', 
              fontFamily: 'Arial, sans-serif' 
            }}
          >
            {currentExpert.description}
          </p>
          {currentExpert.instagram && (
            <a 
              href={`https://instagram.com/${currentExpert.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm sm:text-base hover:underline inline-flex items-center gap-1 hover:text-[#e6963a] transition-colors justify-center"
              style={{ color: '#2d5a3d' }}
            >
              <Users className="w-4 h-4" />
              @{currentExpert.instagram}
            </a>
          )}
        </div>
      )}

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {experts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex 
                ? 'bg-[#2d5a3d] w-8' 
                : 'bg-[#2d5a3d]/30 hover:bg-[#2d5a3d]/50 w-2'
            }`}
            aria-label={`Go to expert ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}