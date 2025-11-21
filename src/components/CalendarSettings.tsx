import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar, Save, RefreshCw } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface CalendarSettingsProps {
  accessToken: string;
}

interface CalendarConfig {
  startDate: string; // формат: YYYY-MM-DD
  manuallyUnlockedDays: number[]; // дні які адмін вручну розблокував
}

export function CalendarSettings({ accessToken }: CalendarSettingsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<CalendarConfig>({
    startDate: '2024-12-01',
    manuallyUnlockedDays: [],
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/admin/calendar-config`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to load calendar config');
        return;
      }

      const data = await response.json();
      console.log('Loaded calendar config:', data);
      
      if (data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error loading calendar config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      console.log('Saving calendar config:', config);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/admin/calendar-config`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ config }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save calendar config');
      }

      const result = await response.json();
      console.log('Calendar config saved successfully:', result);
      alert('Налаштування календаря успішно збережено!');
    } catch (error) {
      console.error('Error saving calendar config:', error);
      alert('Помилка збереження налаштувань');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDayUnlock = (day: number) => {
    setConfig(prev => {
      const manuallyUnlockedDays = prev.manuallyUnlockedDays.includes(day)
        ? prev.manuallyUnlockedDays.filter(d => d !== day)
        : [...prev.manuallyUnlockedDays, day].sort((a, b) => a - b);
      
      return { ...prev, manuallyUnlockedDays };
    });
  };

  const unlockAllDays = () => {
    setConfig(prev => ({
      ...prev,
      manuallyUnlockedDays: Array.from({ length: 24 }, (_, i) => i + 1),
    }));
  };

  const lockAllDays = () => {
    setConfig(prev => ({
      ...prev,
      manuallyUnlockedDays: [],
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Завантаження...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Налаштування календаря
          </CardTitle>
          <CardDescription>
            Керуйте датою старту марафону та вручну відкривайте/закривайте дні для учасників
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Дата старту */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Дата старту марафону</Label>
            <Input
              id="startDate"
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
              className="max-w-xs"
            />
            <p className="text-sm text-gray-500">
              З цієї дати почне відкриватися день 1, потім 2, 3... кожного наступного дня
            </p>
          </div>

          {/* Вручну розблоковані дні */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Вручну розблоковані дні</Label>
              <div className="flex gap-2">
                <Button
                  onClick={unlockAllDays}
                  variant="outline"
                  size="sm"
                >
                  Розблокувати всі
                </Button>
                <Button
                  onClick={lockAllDays}
                  variant="outline"
                  size="sm"
                >
                  Заблокувати всі
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Ці дні будуть доступні користувачам незалежно від дати та прогресу
            </p>
            
            {/* Сітка днів */}
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, i) => i + 1).map((day) => {
                const isUnlocked = config.manuallyUnlockedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDayUnlock(day)}
                    className={`
                      h-12 rounded-lg border-2 transition-all
                      ${isUnlocked 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-semibold">{day}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                {config.manuallyUnlockedDays.length} / 24 розблоковано
              </Badge>
            </div>
          </div>

          {/* Кнопки збереження */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="flex items-center gap-2"
              style={{ backgroundColor: '#2d5a3d' }}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Збереження...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Зберегти налаштування
                </>
              )}
            </Button>
            <Button
              onClick={loadConfig}
              variant="outline"
              disabled={isSaving}
            >
              Скасувати
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Інфо панель */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Як працює логіка?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p><strong>1. Автоматичне відкриття:</strong> Кожного дня після дати старту відкривається новий день (1→2→3...)</p>
          <p><strong>2. Вручну розблоковані дні:</strong> Ви можете вручну відкрити будь-які дні для ВСІХ користувачів, незалежно від дати та прогресу</p>
          <p><strong>3. Комбінація:</strong> Користувач може побачити день якщо він вручну розблокований вами, або якщо він адмін</p>
          <p><strong>4. Приклад:</strong> Якщо ви розблокували тільки дні 1 та 2 - користувачі побачать ТІЛЬКИ ці дні (навіть якщо сьогодні 5 грудня)</p>
        </CardContent>
      </Card>
    </div>
  );
}