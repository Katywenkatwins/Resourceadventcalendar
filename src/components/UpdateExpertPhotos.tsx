import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ExpertPhotoMapping {
  day: number;
  name: string;
  photoUrl: string;
}

export function UpdateExpertPhotos() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Маппінг експертів до днів з новими фото
  const expertPhotos: ExpertPhotoMapping[] = [
    { day: 1, name: 'Сміян Катерина', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Frame%20289%203.png?raw=true' },
    { day: 2, name: 'Анастасія Черкіс', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Cherkis.png?raw=true' },
    { day: 3, name: 'Тетяна Славік', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Slavik.png?raw=true' },
    { day: 4, name: 'Джулі Чеканська', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Chekanska.png?raw=true' },
    { day: 5, name: 'Олександр Король', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Korol.png?raw=true' },
    { day: 6, name: 'Іра Іванова', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Ivanova.png?raw=true' },
    { day: 7, name: 'Ірина Вернигора', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Vernygora.png?raw=true' },
    { day: 8, name: 'Наталі Лабик', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Labik.png?raw=true' },
    { day: 9, name: 'Ганна Стояновська', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Green.png?raw=true' },
    { day: 10, name: 'Ванесса Січ', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Sich.png?raw=true' },
    { day: 11, name: 'Андріана Кушнір', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Kushnir.png?raw=true' },
    { day: 12, name: 'Саша', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Sasha.png?raw=true' },
    { day: 13, name: 'Ольга Карабиньош', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Karab.png?raw=true' },
    { day: 14, name: 'Ксенія Недолуженко', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Nedolu.png?raw=true' },
    { day: 15, name: 'Летиція Дубовик', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Letic.png?raw=true' },
    { day: 16, name: 'Ірина Фалатович', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/falatovich.png?raw=true' },
    { day: 17, name: 'Ірина Гончаренко', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/goncharenko.png?raw=true' },
    { day: 18, name: 'Анна Канаха', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Kanakha.png?raw=true' },
    { day: 19, name: 'Лілія Братусь', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Frame%2048097616.png?raw=true' },
    { day: 20, name: 'Kristina Elias', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/KrisElias.png?raw=true' },
    { day: 21, name: 'Катерина Вишня', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Vushnya.png?raw=true' },
    { day: 22, name: 'Таня Прозорова', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Prozor.png?raw=true' },
    { day: 23, name: 'Наталія Прокопчук', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/Prokop.png?raw=true' },
    { day: 24, name: 'Оксана Шуфрич', photoUrl: 'https://github.com/Katywenkatwins/advent-marafon/blob/main/shufr.png?raw=true' },
  ];

  const handleUpdatePhotos = async () => {
    setIsUpdating(true);
    setStatus('Починаємо оновлення...');

    const accessToken = localStorage.getItem('advent_access_token');
    let successCount = 0;
    let errorCount = 0;

    for (const expert of expertPhotos) {
      try {
        setStatus(`Оновлюємо день ${expert.day}: ${expert.name}...`);

        // Спочатку отримуємо поточні дані експерта
        const getResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/content/day/${expert.day}/expert`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        let currentExpert = {};
        if (getResponse.ok) {
          const data = await getResponse.json();
          currentExpert = data.expert || {};
        }

        // Оновлюємо з новим фото
        const updateResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/content/day/${expert.day}/expert`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...currentExpert,
              name: expert.name,
              photoUrl: expert.photoUrl,
            }),
          }
        );

        if (updateResponse.ok) {
          successCount++;
          console.log(`✅ День ${expert.day} оновлено: ${expert.name}`);
        } else {
          errorCount++;
          console.error(`❌ Помилка при оновленні дня ${expert.day}:`, await updateResponse.text());
        }

        // Невелика затримка між запитами
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.error(`❌ Помилка при оновленні дня ${expert.day}:`, error);
      }
    }

    setStatus(`Завершено! Успішно: ${successCount}, Помилок: ${errorCount}`);
    setIsUpdating(false);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl mb-4" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>
        Оновлення фото експертів
      </h2>
      
      <p className="mb-4" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
        Цей інструмент оновить фото всіх {expertPhotos.length} експертів у базі даних новими посиланнями.
      </p>

      <div className="mb-4">
        <h3 className="font-semibold mb-2" style={{ color: '#2d5a3d' }}>Експерти для оновлення:</h3>
        <div className="max-h-60 overflow-y-auto border rounded p-2" style={{ borderColor: '#2d5a3d20' }}>
          {expertPhotos.map((expert) => (
            <div key={expert.day} className="text-sm py-1" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
              День {expert.day}: {expert.name}
            </div>
          ))}
        </div>
      </div>

      {status && (
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#2d5a3d10', color: '#1e3a5f' }}>
          {status}
        </div>
      )}

      <Button
        onClick={handleUpdatePhotos}
        disabled={isUpdating}
        className="w-full"
        style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1' }}
      >
        {isUpdating ? 'Оновлення...' : 'Оновити всі фото експертів'}
      </Button>
    </Card>
  );
}