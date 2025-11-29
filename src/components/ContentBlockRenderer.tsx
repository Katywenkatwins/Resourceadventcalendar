import { ContentBlock } from '../types/contentBlocks';
import { Button } from './ui/button';
import { ExternalLink, Download, Play } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

// Функція для конвертації GitHub blob URL в raw URL для прямого завантаження зображень
const convertGitHubUrl = (url: string) => {
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }
  return url;
};

// Функція для конвертації YouTube URL в embed URL
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  
  // Перевірка різних форматів YouTube URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^&]+)/,
    /(?:youtube\.com\/embed\/)([^&]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  // Якщо вже embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  return null;
};

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case 'heading':
            return (
              <h3
                key={block.id}
                className="text-xl md:text-2xl"
                style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif', fontWeight: '700' }}
              >
                {block.text}
              </h3>
            );

          case 'subheading':
            return (
              <h4
                key={block.id}
                className="text-lg md:text-xl"
                style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}
              >
                {block.text}
              </h4>
            );

          case 'paragraph':
            return (
              <p
                key={block.id}
                className="text-base md:text-lg whitespace-pre-line"
                style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}
              >
                {block.text}
              </p>
            );

          case 'button':
            return (
              <div key={block.id} className="flex gap-4">
                <Button
                  asChild
                  variant={block.variant === 'primary' ? 'default' : 'outline'}
                  className={
                    block.variant === 'primary'
                      ? ''
                      : 'border-2 hover:bg-[#2d5a3d]/10'
                  }
                  style={
                    block.variant === 'primary'
                      ? { backgroundColor: '#2d5a3d', color: '#e8e4e1', fontFamily: 'Arial, sans-serif' }
                      : { borderColor: '#2d5a3d', color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }
                  }
                >
                  <a href={block.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {block.text}
                  </a>
                </Button>
              </div>
            );

          case 'audio':
            return (
              <div key={block.id} className="space-y-2">
                {block.title && (
                  <p className="text-sm" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                    {block.title}
                  </p>
                )}
                <audio controls className="w-full" style={{ borderRadius: '8px' }}>
                  <source src={block.url} />
                  Ваш браузер не підтримує аудіо.
                </audio>
              </div>
            );

          case 'video':
            return (
              <div key={block.id} className="space-y-2">
                {block.title && (
                  <p className="text-sm" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                    {block.title}
                  </p>
                )}
                <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                  {block.url.includes('youtube.com') || block.url.includes('youtu.be') ? (
                    <iframe
                      className="w-full h-full"
                      src={getYouTubeEmbedUrl(block.url) || ''}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls className="w-full h-full">
                      <source src={block.url} />
                      Ваш браузер не підтримує відео.
                    </video>
                  )}
                </div>
              </div>
            );

          case 'image':
            return (
              <div key={block.id} className="space-y-2">
                <ImageWithFallback
                  src={convertGitHubUrl(block.url)}
                  alt={block.alt || ''}
                  className="w-full rounded-2xl"
                  style={{ maxHeight: '500px', objectFit: 'cover' }}
                />
                {block.caption && (
                  <p className="text-sm text-center" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                    {block.caption}
                  </p>
                )}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}