import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ExpertData } from '../types/dayData';

interface ExpertEditorProps {
  expert: ExpertData;
  onChange: (expert: ExpertData) => void;
}

export function ExpertEditor({ expert, onChange }: ExpertEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Ім'я експерта
        </Label>
        <Input
          placeholder="Ім'я Прізвище"
          value={expert.name}
          onChange={(e) => onChange({ ...expert, name: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Напрямок діяльності (опційно)
        </Label>
        <Textarea
          placeholder="Наприклад: Веб-дизайнерка, стратег і творча менторка"
          value={expert.role || ''}
          onChange={(e) => onChange({ ...expert, role: e.target.value })}
          className="mt-1 min-h-[60px]"
        />
      </div>

      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          Про експерта
        </Label>
        <Textarea
          placeholder="Короткий опис експерта"
          value={expert.bio}
          onChange={(e) => onChange({ ...expert, bio: e.target.value })}
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div>
        <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
          URL фото (опційно)
        </Label>
        <Input
          placeholder="https://example.com/photo.jpg"
          value={expert.photoUrl || ''}
          onChange={(e) => onChange({ ...expert, photoUrl: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="pt-4 border-t" style={{ borderColor: '#2d5a3d20' }}>
        <h4 className="mb-3" style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
          Соціальні мережі (опційно)
        </h4>

        <div className="space-y-3">
          <div>
            <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
              Instagram
            </Label>
            <Input
              placeholder="https://www.instagram.com/username/"
              value={expert.social?.instagram || ''}
              onChange={(e) => onChange({ 
                ...expert, 
                social: { ...expert.social, instagram: e.target.value } 
              })}
              className="mt-1"
            />
          </div>

          <div>
            <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
              Telegram
            </Label>
            <Input
              placeholder="https://t.me/username"
              value={expert.social?.telegram || ''}
              onChange={(e) => onChange({ 
                ...expert, 
                social: { ...expert.social, telegram: e.target.value } 
              })}
              className="mt-1"
            />
          </div>

          <div>
            <Label style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
              Вебсайт / Портфоліо
            </Label>
            <Input
              placeholder="https://example.com"
              value={expert.social?.website || ''}
              onChange={(e) => onChange({ 
                ...expert, 
                social: { ...expert.social, website: e.target.value } 
              })}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
