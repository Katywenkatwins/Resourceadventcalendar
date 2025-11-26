import { Lock } from 'lucide-react';
import { CalendarDay } from '../data/calendarData';
import { DoorCardWrapper } from './DoorCardWrapper';

interface LockedDoorCardProps {
  day: CalendarDay;
}

export function LockedDoorCard({ day }: LockedDoorCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl cursor-not-allowed opacity-60"
      style={{
        width: `${day.size.width}px`,
        height: `${day.size.height}px`,
        backgroundColor: '#d1ccc6', // Трохи темніший фон для заблокованих
      }}
    >
      <DoorCardWrapper transform={day.transform} width={day.size.width} height={day.size.height}>
        {/* Фоновий номер дня */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-8xl opacity-5" style={{ color: '#052311', fontWeight: 700 }}>{day.day}</div>
        </div>
        
        {/* Замок зверху */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Lock 
            className="w-40 h-40" 
            style={{ 
              color: '#f3f4f6',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.9))',
              strokeWidth: 2
            }} 
          />
        </div>
      </DoorCardWrapper>
    </div>
  );
}