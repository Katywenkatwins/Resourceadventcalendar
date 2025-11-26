import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  compact?: boolean;
  dark?: boolean; // Для темної FAQ секції
}

export function CountdownTimer({ compact = false, dark = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Адвент-календар стартує 1 грудня 2025 о 08:00 за Київським часом
    const adventStart = new Date('2025-12-01T08:00:00+02:00');
    
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

  // Компактний варіант для header календаря
  if (compact) {
    return (
      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm" style={{ color: '#052311' }}>
        <span className="opacity-70">До старту:</span>
        <div className="flex items-center gap-1 font-mono tabular-nums">
          <span className="px-1.5 py-0.5 bg-white/50 rounded" style={{ color: '#d94a4a' }}>
            {String(timeLeft.days).padStart(2, '0')}д
          </span>
          <span className="px-1.5 py-0.5 bg-white/50 rounded" style={{ color: '#d94a4a' }}>
            {String(timeLeft.hours).padStart(2, '0')}г
          </span>
          <span className="px-1.5 py-0.5 bg-white/50 rounded hidden sm:inline" style={{ color: '#d94a4a' }}>
            {String(timeLeft.minutes).padStart(2, '0')}хв
          </span>
        </div>
      </div>
    );
  }

  // Темний варіант для FAQ секції
  if (dark) {
    return (
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
    );
  }

  // Повний варіант для landing page
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {[
        { label: 'Днів', value: timeLeft.days },
        { label: 'Годин', value: timeLeft.hours },
        { label: 'Хвилин', value: timeLeft.minutes },
        { label: 'Секунд', value: timeLeft.seconds },
      ].map((item) => (
        <div key={item.label} className="text-center bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 shadow-md border" style={{ borderColor: 'rgba(217,74,74,0.2)' }}>
          <div className="text-3xl sm:text-4xl md:text-5xl mb-2 tabular-nums" style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}>
            {String(item.value).padStart(2, '0')}
          </div>
          <div className="text-xs sm:text-sm" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}