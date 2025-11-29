import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Отримати контент дня
app.get('/day/:day', async (c) => {
  try {
    const day = c.req.param('day');
    const dayNumber = parseInt(day, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 24) {
      return c.json({ error: 'Invalid day number' }, 400);
    }

    const content = await kv.get(`day-content-${dayNumber}`);
    
    if (!content) {
      return c.json({ content: null });
    }

    return c.json({ content: JSON.parse(content as string) });
  } catch (error) {
    console.error('Error fetching day content:', error);
    return c.json({ error: 'Failed to fetch day content' }, 500);
  }
});

// Зберегти контент дня (тільки для адміна)
app.post('/day/:day', async (c) => {
  try {
    const day = c.req.param('day');
    const dayNumber = parseInt(day, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 24) {
      return c.json({ error: 'Invalid day number' }, 400);
    }

    const body = await c.req.json();
    const { content } = body;

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    // Зберігаємо контент в KV store
    await kv.set(`day-content-${dayNumber}`, JSON.stringify(content));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving day content:', error);
    return c.json({ error: 'Failed to save day content' }, 500);
  }
});

// Отримати контент всіх днів
app.get('/all', async (c) => {
  try {
    const parsedContent = [];
    
    // Отримуємо контент для кожного дня (1-24)
    for (let day = 1; day <= 24; day++) {
      const contentKey = `day-content-${day}`;
      const expertKey = `day-expert-${day}`;
      const themeKey = `day-theme-${day}`;
      
      const content = await kv.get(contentKey);
      const expert = await kv.get(expertKey);
      const theme = await kv.get(themeKey);
      
      if (content || expert || theme) {
        parsedContent.push({
          day,
          content: content ? (typeof content === 'string' ? JSON.parse(content) : content) : null,
          expert: expert ? (typeof expert === 'string' ? JSON.parse(expert) : expert) : null,
          theme: theme ? (typeof theme === 'string' ? JSON.parse(theme) : theme) : null,
        });
      }
    }

    console.log(`Loaded ${parsedContent.length} days with content`);
    return c.json({ content: parsedContent });
  } catch (error) {
    console.error('Error fetching all day content:', error);
    return c.json({ error: 'Failed to fetch all day content' }, 500);
  }
});

// ============ ЕКСПЕРТ ============

// Отримати дані експерта дня
app.get('/day/:day/expert', async (c) => {
  try {
    const day = c.req.param('day');
    const dayNumber = parseInt(day, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 24) {
      return c.json({ error: 'Invalid day number' }, 400);
    }

    const expertData = await kv.get(`day-expert-${dayNumber}`);
    
    if (!expertData) {
      console.log('No expert data found for day', dayNumber);
      return c.json({ expert: null });
    }

    const parsedExpert = JSON.parse(expertData as string);
    console.log('Retrieved expert data for day', dayNumber, ':', parsedExpert);
    console.log('Expert photoUrl:', parsedExpert.photoUrl);
    console.log('Expert social:', parsedExpert.social);
    console.log('Expert Instagram:', parsedExpert.social?.instagram);

    return c.json({ expert: parsedExpert });
  } catch (error) {
    console.error('Error fetching expert data:', error);
    return c.json({ error: 'Failed to fetch expert data' }, 500);
  }
});

// Зберегти дані експерта дня
app.post('/day/:day/expert', async (c) => {
  try {
    const day = c.req.param('day');
    const dayNumber = parseInt(day, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 24) {
      return c.json({ error: 'Invalid day number' }, 400);
    }

    const body = await c.req.json();
    console.log('Received expert body:', body);
    const { expert } = body;

    if (!expert) {
      return c.json({ error: 'Expert data is required' }, 400);
    }

    console.log('Saving expert data for day', dayNumber, ':', expert);
    console.log('Expert photoUrl:', expert.photoUrl);
    console.log('Expert social:', expert.social);
    console.log('Expert Instagram:', expert.social?.instagram);

    // Зберігаємо дані експерта в KV store
    await kv.set(`day-expert-${dayNumber}`, JSON.stringify(expert));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving expert data:', error);
    return c.json({ error: 'Failed to save expert data' }, 500);
  }
});

// ============ ТЕМА ДНЯ ============

// Отримати дані теми дня
app.get('/day/:day/theme', async (c) => {
  try {
    const day = c.req.param('day');
    const dayNumber = parseInt(day, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 24) {
      return c.json({ error: 'Invalid day number' }, 400);
    }

    const themeData = await kv.get(`day-theme-${dayNumber}`);
    
    if (!themeData) {
      console.log('No theme data found for day', dayNumber);
      return c.json({ theme: null });
    }

    const parsedTheme = JSON.parse(themeData as string);
    console.log('Retrieved theme data for day', dayNumber, ':', parsedTheme);
    console.log('Theme videoUrl:', parsedTheme.videoUrl);
    console.log('Theme videoThumbnail:', parsedTheme.videoThumbnail);
    console.log('Theme bonus:', parsedTheme.bonus);

    return c.json({ theme: parsedTheme });
  } catch (error) {
    console.error('Error fetching theme data:', error);
    return c.json({ error: 'Failed to fetch theme data' }, 500);
  }
});

// Зберегти дані теми дня
app.post('/day/:day/theme', async (c) => {
  try {
    const day = c.req.param('day');
    const dayNumber = parseInt(day, 10);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 24) {
      return c.json({ error: 'Invalid day number' }, 400);
    }

    const body = await c.req.json();
    console.log('Received theme body:', body);
    const { theme } = body;

    if (!theme) {
      return c.json({ error: 'Theme data is required' }, 400);
    }

    console.log('Saving theme data for day', dayNumber, ':', theme);
    console.log('Theme videoUrl:', theme.videoUrl);
    console.log('Theme videoThumbnail:', theme.videoThumbnail);
    console.log('Theme bonus:', theme.bonus);

    // Зберігаємо дані теми в KV store
    await kv.set(`day-theme-${dayNumber}`, JSON.stringify(theme));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving theme data:', error);
    return c.json({ error: 'Failed to save theme data' }, 500);
  }
});

export default app;