import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { CalendarDay } from '../data/calendarData';
import { DoorCardWrapper } from './DoorCardWrapper';
import { ImageWithFallback } from './figma/ImageWithFallback';
import img1 from 'figma:asset/f5864068b48e689e8cbb7001ecb1b7588f6561ef.png';
import img2 from 'figma:asset/cfa8b96bcd7c73a21a8d72a5db1876a97f607252.png';
import img3 from 'figma:asset/50f04777d9f4544671e50a00c99d5d40299a1da0.png';
import img4 from 'figma:asset/f6bc7f47ad29b29fa2950beba1e2cdb101b3f9e0.png';
import img5 from 'figma:asset/8601cebe9b639e91a4c7ec8d2e1c6ddf9522a16c.png';
import img6 from 'figma:asset/4d3716ed56e7b6ac8f2125b4b7e049ebf20d7084.png';
import img7 from 'figma:asset/722a8f676033829fefddd6e56d0da8aa9e69d5be.png';
import img8 from 'figma:asset/de002aabc361fe9926d63bca5d534bbc728ac603.png';
import img9 from 'figma:asset/4b46839eb865376ce501b09c8b56f1d89a31e9f1.png';
import img10 from 'figma:asset/9cd0ff0b9e8691b12e342aabe205a1d9b945841e.png';
import img11 from 'figma:asset/a523f716e5e14de61e6a4380a0fd2728062f6527.png';
import img12 from 'figma:asset/5c6e192fffc1909fd8a0fe040bb0158c5c5cf54f.png';
import img13 from 'figma:asset/e1b3d8ec130fc6d0cd7b75c4ffd5f9bd135c750f.png';
import img14 from 'figma:asset/d128824e1b4338684c8750f12291f8ca4fc5dfc8.png';
import img15 from 'figma:asset/17414e03aed1059cf6be38447e22b9d591f064d1.png';
import img16 from 'figma:asset/4e856bc8f07c0dd3209e046dfe902fbaeab7590d.png';
import img17 from 'figma:asset/37937f04e25c1d9f84b51245069684ab4f422b7f.png';
import img18 from 'figma:asset/f78c4dfb5b593e4cc4ac67f155023ca896e9c933.png';
import img19 from 'figma:asset/76b393cbe43c66b0867228a22f3a454c495be045.png';
import img20 from 'figma:asset/f689a3006cc4bddc97a92de9c9e00338cb866c84.png';
import img21 from 'figma:asset/3327205be185cdb0a3891c527dca3ac35377a265.png';
import img22 from 'figma:asset/fc9c908a8f483b316e564f32a548b874f73aab49.png';
import img23 from 'figma:asset/a2701264d11655a89cc2508b8123751b745815e9.png';
import img24 from 'figma:asset/10845ab847f51b07f1a033f8a3951aae05f77b86.png';

interface DoorOpeningAnimationProps {
  day: CalendarDay;
  onComplete: () => void;
}

const cardImages: Record<number, string> = {
  1: img1, 2: img2, 3: img3, 4: img4, 5: img5, 6: img6,
  7: img7, 8: img8, 9: img9, 10: img10, 11: img11, 12: img12,
  13: img13, 14: img14, 15: img15, 16: img16, 17: img17, 18: img18,
  19: img19, 20: img20, 21: img21, 22: img22, 23: img23, 24: img24,
};

// Генерація снігових частинок
const generateSnowParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    // Кут вильоту у всі сторони (360 градусів)
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    // Збільшена відстань вильоту для більшого охоплення екрану
    const distance = 120 + Math.random() * 250;
    
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: Math.random() * 24 + 14, // Більші частинки (14-38px)
      delay: Math.random() * 0.15,
      duration: Math.random() * 1.2 + 1.0,
      rotation: Math.random() * 360,
    };
  });
};

export function DoorOpeningAnimation({ day, onComplete }: DoorOpeningAnimationProps) {
  const [showSnow, setShowSnow] = useState(false);
  const [particles] = useState(generateSnowParticles(180)); // Збільшено кількість частинок

  useEffect(() => {
    // Показуємо сніг одразу як починають відкриватись дверцята
    const snowTimer = setTimeout(() => setShowSnow(true), 200);
    
    // Завершуємо анімацію - залишаємо екран білим
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800); // Зменшили з 3500 до 2800ms

    return () => {
      clearTimeout(snowTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const imageUrl = cardImages[day.day];
  
  // Обчислюємо розмір дверцят - максимум 80% ширини екрану і компактні
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 800;
  const doorWidth = Math.min(day.size.width * 0.6, maxWidth); // 60% від оригіналу
  const doorHeight = (doorWidth / day.size.width) * day.size.height;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ 
        perspective: '2000px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
    >
      {/* Білий прямокутник (дверний проєм) точно розміру дверцят - під ними на початку */}
      <motion.div
        style={{
          position: 'absolute',
          width: `${doorWidth}px`,
          height: `${doorHeight}px`,
          backgroundColor: '#ffffff',
          boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.08), inset 0 -5px 15px rgba(0,0,0,0.08), inset 5px 0 15px rgba(0,0,0,0.06), inset -5px 0 15px rgba(0,0,0,0.06)',
          zIndex: 1,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
      />

      {/* Container for proper left-edge rotation */}
      <div
        style={{
          position: 'relative',
          width: `${doorWidth}px`,
          height: `${doorHeight}px`,
          transformStyle: 'preserve-3d',
          zIndex: 3, // Дверцята найвище
        }}
      >
        {/* 3D Door Animation */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
          }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -125 }}
          transition={{ 
            duration: 1.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {/* Door Front */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              overflow: 'hidden',
              boxShadow: '-20px 0 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            <DoorCardWrapper transform={day.transform} width={doorWidth} height={doorHeight}>
              {imageUrl && (
                <ImageWithFallback
                  src={imageUrl}
                  alt={`День ${day.day}`}
                  className="size-full object-cover"
                />
              )}
            </DoorCardWrapper>
            
            {/* Номер дня на дверцятах */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
              }}
            >
              <div 
                className="text-8xl font-bold"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.3)',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {day.day}
              </div>
            </div>
          </div>

          {/* Door Back (inside) - біла сторона такого ж розміру */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#ffffff',
            }}
          />
        </motion.div>
      </div>

      {/* Snow/Smoke Particles Explosion */}
      <AnimatePresence>
        {showSnow && (
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'hidden',
              zIndex: 2, // Між білим прямокутником (1) і дверцятами (3)
            }}
          >
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 0,
                }}
                animate={{ 
                  x: `${particle.x}vw`,
                  y: `${particle.y}vh`,
                  scale: [0, 1.5, 1, 0],
                  opacity: [0, 1, 0.8, 0],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
            
            {/* Центральний вибух світла - БІЛЬШИЙ */}
            <motion.div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '2000px',
                height: '2000px',
                marginLeft: '-1000px',
                marginTop: '-1000px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 30%, rgba(255, 255, 255, 0.6) 60%, rgba(255, 255, 255, 0) 80%)',
                filter: 'blur(100px)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 4, 5],
                opacity: [0, 1, 1],
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
              }}
            />
            
            {/* Білий флеш на весь екран - залишається білим */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 1)',
                zIndex: 100,
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0, 0.3, 0.7, 1, 1],
              }}
              transition={{
                duration: 2.0,
                delay: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}