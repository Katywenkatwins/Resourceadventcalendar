// Типи для збереження даних днів в базі даних

export interface ExpertData {
  name: string;
  role?: string; // Напрямок діяльності
  bio: string; // Про експерта
  photoUrl?: string;
  social?: {
    instagram?: string;
    telegram?: string;
    website?: string;
  };
}

export interface ThemeData {
  title: string;
  subtitle: string;
  description: string;
  theme: string; // Badge - тема (наприклад, "Тіло", "Емоції")
  videoUrl?: string;
  videoThumbnail?: string; // Обкладинка відео
  bonus?: string;
}

export interface FullDayData {
  expert?: ExpertData;
  theme?: ThemeData;
}