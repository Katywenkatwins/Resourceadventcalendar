import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ThemeData } from '../types/dayData';

interface ThemeEditorProps {
  theme: ThemeData;
  onChange: (theme: ThemeData) => void;
}

// Конвертуємо GitHub blob URL в raw URL для прямого завантаження зображень
const convertGitHubUrl = (url: string) => {
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }
  return url;
};

export function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Заголовок дня
        </Label>
        <Textarea
          placeholder="Наприклад: Твоя точка старту. Повернення в себе перед подорожжю"
          value={theme.title}
          onChange={(e) => onChange({ ...theme, title: e.target.value })}
          className="mt-1 min-h-[60px]"
        />
      </div>

      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Підзаголовок
        </Label>
        <Textarea
          placeholder="Наприклад: Перший крок твоєї подорожі — повернення в себе."
          value={theme.subtitle}
          onChange={(e) => onChange({ ...theme, subtitle: e.target.value })}
          className="mt-1 min-h-[60px]"
        />
      </div>

      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Опис
        </Label>
        <Textarea
          placeholder="Детальний опис того, що чекає на користувача цього дня"
          value={theme.description}
          onChange={(e) => onChange({ ...theme, description: e.target.value })}
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Тема (Badge)
        </Label>
        <Input
          placeholder="Наприклад: Повернення у тіло та фіксація стартової точки"
          value={theme.theme}
          onChange={(e) => onChange({ ...theme, theme: e.target.value })}
          className="mt-1"
        />
        <p className="text-xs mt-1" style={{ color: '#1e3a5f99', fontFamily: 'Arial, sans-serif' }}>
          Коротка тема дня, яка відображається як бейдж
        </p>
      </div>

      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          URL відео (YouTube)
        </Label>
        <Input
          placeholder="https://www.youtube.com/watch?v=..."
          value={theme.videoUrl || ''}
          onChange={(e) => onChange({ ...theme, videoUrl: e.target.value })}
          className="mt-1"
        />
        <p className="text-xs mt-1" style={{ color: '#1e3a5f99', fontFamily: 'Arial, sans-serif' }}>
          Посилання на відео від експерта
        </p>
      </div>

      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Обкладинка відео (URL)
        </Label>
        <Input
          placeholder="https://example.com/thumbnail.jpg або https://github.com/..."
          value={theme.videoThumbnail || ''}
          onChange={(e) => onChange({ ...theme, videoThumbnail: e.target.value })}
          className="mt-1"
        />
        <p className="text-xs mt-1" style={{ color: '#1e3a5f99', fontFamily: 'Arial, sans-serif' }}>
          URL обкладинки для відео (якщо не вказано, буде використана стандартна)
        </p>
        {theme.videoThumbnail && (
          <div className="mt-2">
            <img 
              src={convertGitHubUrl(theme.videoThumbnail)} 
              alt="Попередній перегляд обкладинки" 
              className="max-w-full h-auto rounded-lg border-2"
              style={{ borderColor: '#2d5a3d30', maxHeight: '200px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <p className="text-xs mt-1" style={{ color: '#1e3a5f99', fontFamily: 'Arial, sans-serif' }}>
              Зберігається: {theme.videoThumbnail}
            </p>
          </div>
        )}
      </div>

      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Бонус (опційно)
        </Label>
        <Textarea
          placeholder="Додаткова інформація або бонус від експерта"
          value={theme.bonus || ''}
          onChange={(e) => onChange({ ...theme, bonus: e.target.value })}
          className="mt-1 min-h-[80px]"
        />
      </div>
    </div>
  );
}