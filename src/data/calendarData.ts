export interface DayContent {
  day: number;
  title: string;
  expert: string;
  expertBio: string;
  theme: string;
  description: string;
  practice: string;
  bonus: string;
  videoUrl?: string;
}

export interface CalendarDay {
  day: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// Card sizes: 810x810 (small), 810x1440 or 1440x810 (rectangle), 1440x1440 (large)
const GAP = 60;
const S = 810;   // Small
const M = 1440;  // Medium/Large

export const calendarDays: CalendarDay[] = [
  // Row 1
  { day: 1, position: { x: 60, y: 60 }, size: { width: M, height: S } },
  { day: 18, position: { x: 1560, y: 60 }, size: { width: S, height: S } },
  { day: 5, position: { x: 2430, y: 60 }, size: { width: S, height: M } },
  { day: 13, position: { x: 3300, y: 60 }, size: { width: M, height: M } },
  
  // Row 2
  { day: 4, position: { x: 60, y: 930 }, size: { width: S, height: M } },
  { day: 20, position: { x: 930, y: 930 }, size: { width: M, height: M } },
  { day: 3, position: { x: 2430, y: 1560 }, size: { width: M, height: S } },
  { day: 9, position: { x: 3930, y: 1560 }, size: { width: S, height: S } },
  
  // Row 3
  { day: 22, position: { x: 60, y: 2430 }, size: { width: S, height: S } },
  { day: 2, position: { x: 930, y: 2430 }, size: { width: M, height: S } },
  { day: 14, position: { x: 2430, y: 2430 }, size: { width: M, height: S } },
  { day: 23, position: { x: 3930, y: 2430 }, size: { width: S, height: S } },
  
  // Row 4
  { day: 16, position: { x: 60, y: 3300 }, size: { width: M, height: M } },
  { day: 12, position: { x: 1560, y: 3300 }, size: { width: S, height: M } },
  { day: 17, position: { x: 2430, y: 3300 }, size: { width: S, height: M } },
  { day: 21, position: { x: 3300, y: 3300 }, size: { width: M, height: M } },
  
  // Row 5
  { day: 10, position: { x: 60, y: 4800 }, size: { width: S, height: M } },
  { day: 19, position: { x: 930, y: 4800 }, size: { width: M, height: M } },
  { day: 6, position: { x: 2430, y: 4800 }, size: { width: S, height: S } },
  { day: 15, position: { x: 3300, y: 4800 }, size: { width: M, height: S } },
  
  // Row 6
  { day: 8, position: { x: 60, y: 6300 }, size: { width: M, height: S } },
  { day: 11, position: { x: 1560, y: 6300 }, size: { width: S, height: S } },
  { day: 24, position: { x: 2430, y: 5670 }, size: { width: M, height: M } },
  { day: 7, position: { x: 3930, y: 5670 }, size: { width: S, height: M } },
];

const dayContents: DayContent[] = [
  {
    day: 1,
    title: 'Пробудження: Повернення до тіла',
    expert: 'Майкл Роууч',
    expertBio: 'Майстер медитації, викладач буддійської філософії, автор бестселерів',
    theme: 'Повернення до тіла',
    description: 'Почни свій шлях з усвідомленості тіла. Навчися чути сигнали, які воно посилає.',
    practice: `Ранкова практика "Body Scan":

1. Прокинься на 15 хвилин раніше
2. Залишайся в ліжку, закрий очі
3. Повільно проскануй своє тіло від стоп до голови
4. Зверни увагу на відчуття, напругу, тепло чи холод
5. Не оцінюй, просто спостерігай`,
    bonus: '20% знижка на першу соматичну сесію',
    videoUrl: 'https://www.youtube.com/watch?v=FoEgzsxDNv4',
  },
];

// Generate remaining days
for (let i = 2; i <= 24; i++) {
  const day = calendarDays.find(d => d.day === i);
  if (day) {
    dayContents.push({
      day: i,
      title: `День ${i}: трансформація`,
      expert: `Експерт дня ${i}`,
      expertBio: 'Фахівець з трансформаційних практик',
      theme: i <= 6 ? 'Повернення до тіла' : i <= 12 ? 'Емоційна грамотність' : i <= 18 ? 'Кордони & цінності' : 'Нова реальність',
      description: `День ${i}: продовжуємо шлях до нового себе через практики та усвідомленість.`,
      practice: `Практика дня ${i}:

1. Знайди тихе місце на 15-20 хвилин
2. Заземлись через дихання
3. Виконай спеціальну вправу дня
4. Відрефлексуй свій досвід
5. Зроби запис у щоденнику`,
      bonus: 'Спеціальний бонус від експерта',
    });
  }
}

export function getDayContent(day: number): DayContent {
  return dayContents.find(d => d.day === day) || dayContents[0];
}