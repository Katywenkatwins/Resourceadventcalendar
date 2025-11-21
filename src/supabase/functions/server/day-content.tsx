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
      return c.json({ expert: null });
    }

    return c.json({ expert: JSON.parse(expertData as string) });
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
    const { expert } = body;

    if (!expert) {
      return c.json({ error: 'Expert data is required' }, 400);
    }

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
      return c.json({ theme: null });
    }

    return c.json({ theme: JSON.parse(themeData as string) });
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
    const { theme } = body;

    if (!theme) {
      return c.json({ error: 'Theme data is required' }, 400);
    }

    // Зберігаємо дані теми в KV store
    await kv.set(`day-theme-${dayNumber}`, JSON.stringify(theme));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving theme data:', error);
    return c.json({ error: 'Failed to save theme data' }, 500);
  }
});

export default app;