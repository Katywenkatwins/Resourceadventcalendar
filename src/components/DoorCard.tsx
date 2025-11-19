import { motion } from 'motion/react';
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
import img15 from 'figma:asset/17414e03aed1059cf6be38147e22b9d591f064d1.png';
import img16 from 'figma:asset/4e856bc8f07c0dd3209e046dfe902fbaeab7590d.png';
import img17 from 'figma:asset/37937f04e25c1d9f84b51245069684ab4f422b7f.png';
import img18 from 'figma:asset/f78c4dfb5b593e4cc4ac67f155023ca896e9c933.png';
import img19 from 'figma:asset/76b393cbe43c66b0867228a22f3a454c495be045.png';
import img20 from 'figma:asset/f689a3006cc4bddc97a92de9c9e00338cb866c84.png';
import img21 from 'figma:asset/3327205be185cdb0a3891c527dca3ac35377a265.png';
import img22 from 'figma:asset/fc9c908a8f483b316e564f32a548b874f73aab49.png';
import img23 from 'figma:asset/a2701264d11655a89cc2508b8123751b745815e9.png';
import img24 from 'figma:asset/10845ab847f51b07f1a033f8a3951aae05f77b86.png';

interface DoorCardProps {
  day: CalendarDay;
  isUnlocked: boolean;
  isCompleted: boolean;
  isToday: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const cardImages: Record<number, string> = {
  1: img1,
  2: img2,
  3: img3,
  4: img4,
  5: img5,
  6: img6,
  7: img7,
  8: img8,
  9: img9,
  10: img10,
  11: img11,
  12: img12,
  13: img13,
  14: img14,
  15: img15,
  16: img16,
  17: img17,
  18: img18,
  19: img19,
  20: img20,
  21: img21,
  22: img22,
  23: img23,
  24: img24,
};

export function DoorCard({ day, isUnlocked, isCompleted, isToday, onClick }: DoorCardProps) {
  const renderDesign = () => {
    const imageUrl = cardImages[day.day];
    
    if (imageUrl) {
      return (
        <ImageWithFallback
          src={imageUrl}
          alt={`День ${day.day}`}
          className="size-full object-cover"
        />
      );
    }
    
    return (
      <div className="relative size-full flex items-center justify-center bg-[#e8e4e1]">
        <div className="text-6xl opacity-20" style={{ color: '#052311' }}>{day.day}</div>
      </div>
    );
  };

  return (
    <motion.button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={`
        relative overflow-hidden rounded-xl
        transition-all duration-300
        ${isUnlocked ? 'cursor-pointer hover:shadow-2xl' : 'cursor-not-allowed opacity-50'}
      `}
      style={{
        width: `${day.size.width}px`,
        height: `${day.size.height}px`,
      }}
      whileHover={isUnlocked ? { 
        scale: 1.05,
        rotateY: 5,
        transition: { duration: 0.3 }
      } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
    >
      <DoorCardWrapper transform={day.transform} width={day.size.width} height={day.size.height}>
        <div className="absolute inset-0">
          {renderDesign()}
        </div>
      </DoorCardWrapper>

      {/* Completed badge */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center z-20"
          style={{ backgroundColor: '#052311' }}
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}

      {/* Today indicator */}
      {isToday && !isCompleted && (
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full z-20"
          style={{ backgroundColor: '#ce2e2e' }}
        />
      )}

      {/* Locked overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-20" style={{ backgroundColor: 'rgba(232, 228, 225, 0.85)' }}>
          <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#052311' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </motion.button>
  );
}
