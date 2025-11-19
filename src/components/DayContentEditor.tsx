import { useState } from 'react';
import { ContentBlock, ContentBlockType, TierContent } from '../types/contentBlocks';
import { ExpertData, ThemeData } from '../types/dayData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Plus, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Badge } from './ui/badge';
import { ExpertEditor } from './ExpertEditor';
import { ThemeEditor } from './ThemeEditor';

interface DayContentEditorProps {
  day: number;
  initialContent?: TierContent;
  initialExpert?: ExpertData;
  initialTheme?: ThemeData;
  onSave: (day: number, content: TierContent) => void;
  onSaveExpert: (day: number, expert: ExpertData) => void;
  onSaveTheme: (day: number, theme: ThemeData) => void;
  onClose: () => void;
}

export function DayContentEditor({ 
  day, 
  initialContent, 
  initialExpert,
  initialTheme,
  onSave, 
  onSaveExpert,
  onSaveTheme,
  onClose 
}: DayContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'practice' | 'expert' | 'theme'>('practice');
  const [activeTier, setActiveTier] = useState<'basic' | 'deep' | 'premium'>('basic');
  const [content, setContent] = useState<TierContent>(
    initialContent || {
      basic: [],
      deep: [],
      premium: [],
    }
  );
  const [expert, setExpert] = useState<ExpertData>(
    initialExpert || {
      name: '',
      bio: '',
    }
  );
  const [theme, setTheme] = useState<ThemeData>(
    initialTheme || {
      title: '',
      subtitle: '',
      description: '',
      theme: '',
    }
  );

  const tierNames = {
    basic: 'Світло (€10)',
    deep: 'Магія (€35)',
    premium: 'Диво (€100)',
  };

  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      ...(type === 'heading' && { text: '' }),
      ...(type === 'subheading' && { text: '' }),
      ...(type === 'paragraph' && { text: '' }),
      ...(type === 'button' && { text: '', url: '', variant: 'outline' as const }),
      ...(type === 'audio' && { url: '', title: '' }),
      ...(type === 'video' && { url: '', title: '' }),
      ...(type === 'image' && { url: '', alt: '', caption: '' }),
    } as ContentBlock;

    setContent({
      ...content,
      [activeTier]: [...content[activeTier], newBlock],
    });
  };

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    setContent({
      ...content,
      [activeTier]: content[activeTier].map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
    });
  };

  const deleteBlock = (blockId: string) => {
    setContent({
      ...content,
      [activeTier]: content[activeTier].filter((block) => block.id !== blockId),
    });
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...content[activeTier]];
    const index = blocks.findIndex((b) => b.id === blockId);
    
    if (direction === 'up' && index > 0) {
      [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }

    setContent({
      ...content,
      [activeTier]: blocks,
    });
  };

  const handleSave = () => {
    onSave(day, content);
    onClose();
  };

  const handleSaveExpert = () => {
    onSaveExpert(day, expert);
    onClose();
  };

  const handleSaveTheme = () => {
    onSaveTheme(day, theme);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: '#2d5a3d20' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl" style={{ color: '#2d5a3d', fontFamily: "'Dela Gothic One', sans-serif" }}>
              Редагування дня {day}
            </h2>
            <Button
              variant="ghost"
              onClick={onClose}
              style={{ color: '#1e3a5f' }}
            >
              ✕
            </Button>
          </div>

          {/* Tab buttons */}
          <div className="flex gap-2">
            <button
              key="practice"
              onClick={() => setActiveTab('practice')}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: activeTab === 'practice' ? '#2d5a3d' : 'transparent',
                color: activeTab === 'practice' ? '#e8e4e1' : '#1e3a5f',
                border: activeTab === 'practice' ? 'none' : '1px solid #2d5a3d40',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Практика
            </button>
            <button
              key="expert"
              onClick={() => setActiveTab('expert')}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: activeTab === 'expert' ? '#2d5a3d' : 'transparent',
                color: activeTab === 'expert' ? '#e8e4e1' : '#1e3a5f',
                border: activeTab === 'expert' ? 'none' : '1px solid #2d5a3d40',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Експерт
            </button>
            <button
              key="theme"
              onClick={() => setActiveTab('theme')}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: activeTab === 'theme' ? '#2d5a3d' : 'transparent',
                color: activeTab === 'theme' ? '#e8e4e1' : '#1e3a5f',
                border: activeTab === 'theme' ? 'none' : '1px solid #2d5a3d40',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Тема
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'practice' && (
            <>
              {/* Tier tabs для практики */}
              <div className="flex gap-2 mb-6">
                {(Object.keys(tierNames) as Array<keyof typeof tierNames>).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setActiveTier(tier)}
                    className="px-4 py-2 rounded-lg transition-all text-sm"
                    style={{
                      backgroundColor: activeTier === tier ? '#2d5a3d' : 'transparent',
                      color: activeTier === tier ? '#e8e4e1' : '#1e3a5f',
                      border: activeTier === tier ? 'none' : '1px solid #2d5a3d40',
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    {tierNames[tier]}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-sm mb-4" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                  Додайте блоки контенту для тарифу <strong>{tierNames[activeTier]}</strong>:
                </p>

                {/* Add block buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('heading')}
                    className="border-2"
                    style={{ borderColor: '#2d5a3d', color: '#2d5a3d' }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Заголовок
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('subheading')}
                    className="border-2"
                    style={{ borderColor: '#2d5a3d', color: '#2d5a3d' }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Підзаголовок
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('paragraph')}
                    className="border-2"
                    style={{ borderColor: '#2d5a3d', color: '#2d5a3d' }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Абзац
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('button')}
                    className="border-2"
                    style={{ borderColor: '#2d5a3d', color: '#2d5a3d' }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Кнопка
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('audio')}
                    className="border-2"
                    style={{ borderColor: '#2d5a3d', color: '#2d5a3d' }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Аудіо
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('video')}
                    className="border-2"
                    style={{ borderColor: '#2d5a3d', color: '#2d5a3d' }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Відео
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addBlock('image')}
                    className="border-2"
                    style={{ borderColor: '#2d5a3d', color: '#2d5a3d' }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Фото
                  </Button>
                </div>
              </div>

              {/* Blocks list */}
              <div className="space-y-4">
                {content[activeTier].length === 0 ? (
                  <div className="text-center py-12 rounded-xl" style={{ backgroundColor: '#2d5a3d10' }}>
                    <p style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                      Поки що немає блоків. Додайте перший блок вище.
                    </p>
                  </div>
                ) : (
                  content[activeTier].map((block, index) => (
                    <div
                      key={block.id}
                      className="p-4 rounded-xl border-2"
                      style={{ borderColor: '#2d5a3d20', backgroundColor: '#fff' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1' }}>
                          {block.type === 'heading' && 'Заголовок'}
                          {block.type === 'subheading' && 'Підзаголовок'}
                          {block.type === 'paragraph' && 'Абзац'}
                          {block.type === 'button' && 'Кнопка'}
                          {block.type === 'audio' && 'Аудіо'}
                          {block.type === 'video' && 'Відео'}
                          {block.type === 'image' && 'Фото'}
                        </Badge>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveBlock(block.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveBlock(block.id, 'down')}
                            disabled={index === content[activeTier].length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteBlock(block.id)}
                            style={{ color: '#CE2E2E' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Block fields */}
                      {(block.type === 'heading' || block.type === 'subheading') && (
                        <Input
                          placeholder="Введіть текст"
                          value={block.text}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          className="w-full"
                        />
                      )}

                      {block.type === 'paragraph' && (
                        <Textarea
                          placeholder="Введіть текст абзацу"
                          value={block.text}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          className="w-full min-h-[100px]"
                        />
                      )}

                      {block.type === 'button' && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Текст кнопки"
                            value={block.text}
                            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          />
                          <Input
                            placeholder="Посилання (URL)"
                            value={block.url}
                            onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                          />
                          <select
                            value={block.variant || 'outline'}
                            onChange={(e) => updateBlock(block.id, { variant: e.target.value as 'primary' | 'secondary' | 'outline' })}
                            className="w-full px-3 py-2 rounded-md border"
                            style={{ borderColor: '#2d5a3d40' }}
                          >
                            <option value="primary">Основна</option>
                            <option value="outline">Контурна</option>
                            <option value="secondary">Вторинна</option>
                          </select>
                        </div>
                      )}

                      {(block.type === 'audio' || block.type === 'video') && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Назва (опційно)"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                          />
                          <Input
                            placeholder="URL файлу"
                            value={block.url}
                            onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                          />
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-2">
                          <Input
                            placeholder="URL зображення"
                            value={block.url}
                            onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                          />
                          <Input
                            placeholder="Альтернативний текст (опційно)"
                            value={block.alt || ''}
                            onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                          />
                          <Input
                            placeholder="Підпис (опційно)"
                            value={block.caption || ''}
                            onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'expert' && (
            <ExpertEditor
              expert={expert}
              onChange={setExpert}
            />
          )}

          {activeTab === 'theme' && (
            <ThemeEditor
              theme={theme}
              onChange={setTheme}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-4" style={{ borderColor: '#2d5a3d20' }}>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-2"
            style={{ borderColor: '#2d5a3d', color: '#2d5a3d' }}
          >
            Скасувати
          </Button>
          {activeTab === 'practice' && (
            <Button
              onClick={handleSave}
              className="px-8"
              style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Зберегти
            </Button>
          )}
          {activeTab === 'expert' && (
            <Button
              onClick={handleSaveExpert}
              className="px-8"
              style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Зберегти
            </Button>
          )}
          {activeTab === 'theme' && (
            <Button
              onClick={handleSaveTheme}
              className="px-8"
              style={{ backgroundColor: '#2d5a3d', color: '#e8e4e1' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Зберегти
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}