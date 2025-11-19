// Це bundle файл для деплою на Supabase Edge Functions
// Скопіюйте весь вміст цього файлу в Supabase Dashboard → Edge Functions → make-server-dc8cbf1f

import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts';
import { cors } from 'https://deno.land/x/hono@v3.11.7/middleware.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { createHmac } from 'node:crypto';

const app = new Hono();

// Enable logger
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});

// Enable CORS
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// ========== KV STORE UTILITIES ==========
const getSupabase = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

const kv = {
  async get(key: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('kv_store_dc8cbf1f')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    
    if (error) {
      console.error(`KV get error for key ${key}:`, error);
      return null;
    }
    
    // Повертаємо value as-is (вже JSONB)
    const value = data?.value || null;
    console.log(`KV get - key: ${key}, value type:`, typeof value, 'is null:', value === null);
    return value;
  },

  async set(key: string, value: any) {
    const supabase = getSupabase();
    
    // ВАЖЛИВО: НЕ робимо JSON.stringify! Supabase автоматично конвертує в JSONB
    // Якщо value вже рядок - це помилка!
    if (typeof value === 'string') {
      console.error(`KV set - ERROR: value is string, should be object! key: ${key}`);
      throw new Error('KV set: value must be an object, not a string');
    }
    
    console.log(`KV set - key: ${key}`);
    console.log(`KV set - value type:`, typeof value);
    console.log(`KV set - value preview:`, { 
      id: value.id, 
      email: value.email, 
      progress: value.progress 
    });
    
    const { error } = await supabase
      .from('kv_store_dc8cbf1f')
      .upsert({
        key,
        value: value  // Передаємо об'єкт напряму, БЕЗ JSON.stringify
      });
    
    if (error) {
      console.error(`KV set error for key ${key}:`, error);
      throw error;
    }
    
    console.log(`KV set - SUCCESS for key: ${key}`);
  },

  async del(key: string) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('kv_store_dc8cbf1f')
      .delete()
      .eq('key', key);
    
    if (error) throw error;
    console.log(`KV del - deleted key: ${key}`);
  },

  async getByPrefix(prefix: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('kv_store_dc8cbf1f')
      .select('value')
      .like('key', `${prefix}%`);
    
    if (error) {
      console.error(`KV getByPrefix error for prefix ${prefix}:`, error);
      return [];
    }
    
    const values = data?.map(row => row.value) || [];
    console.log(`KV getByPrefix - prefix: ${prefix}, found: ${values.length} records`);
    return values;
  }
};

// ========== AUTH UTILITIES ==========
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}

// ========== ROUTES ==========

app.get('/make-server-dc8cbf1f/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    project: 'advent-calendar-2025'
  });
});

// Sign up
app.post('/make-server-dc8cbf1f/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }

    const supabase = getSupabase();
    
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (existingUser?.user_metadata?.project === 'advent-calendar') {
      return c.json({ error: 'A user with this email address has already been registered' }, 400);
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        project: 'advent-calendar',
      }
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    if (data.user) {
      await kv.set(`user:${data.user.id}`, {
        id: data.user.id,
        email,
        name,
        payment_status: 'pending',
        progress: [],
        created_at: new Date().toISOString(),
        project: 'advent-calendar',
      });
    }

    return c.json({ 
      success: true, 
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get profile
app.get('/make-server-dc8cbf1f/profile', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    
    const profile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || userData?.name || '',
      tier: user.user_metadata?.tier || userData?.tier,
      payment_status: user.user_metadata?.payment_status || userData?.payment_status || 'pending',
      progress: userData?.progress || [],
      created_at: userData?.created_at,
      payment_date: user.user_metadata?.payment_date || userData?.payment_date,
    };

    return c.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update progress
app.post('/make-server-dc8cbf1f/progress', async (c) => {
  try {
    console.log('Progress update - Starting');
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { day } = await c.req.json();
    console.log('Progress update - Day:', day, 'User:', user.id);

    if (!day || day < 1 || day > 24) {
      return c.json({ error: 'Invalid day' }, 400);
    }

    let userData = await kv.get(`user:${user.id}`);
    console.log('Progress update - Current userData:', userData);
    
    if (!userData) {
      userData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        tier: user.user_metadata?.tier || 'basic',
        payment_status: user.user_metadata?.payment_status || 'pending',
        progress: [],
        created_at: new Date().toISOString(),
      };
    }

    const progress = userData.progress || [];
    
    if (!progress.includes(day)) {
      progress.push(day);
      progress.sort((a, b) => a - b);
    }

    const updatedData = {
      ...userData,
      progress,
      last_activity: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, updatedData);
    console.log('Progress update - Saved. New progress:', progress);

    return c.json({ success: true, progress });
  } catch (error) {
    console.error('Progress update error:', error);
    return c.json({ error: 'Failed to update progress' }, 500);
  }
});

// Admin: Get all users
app.get('/make-server-dc8cbf1f/admin/users', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    const userEmail = (user?.email || '').toLowerCase().trim();
    
    if (userEmail !== 'katywenka@gmail.com') {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    console.log('Admin users - Starting');

    const supabase = getSupabase();
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    console.log('Admin users - Auth users count:', authUsers?.users.length);
    
    const kvUsers = await kv.getByPrefix('user:');
    console.log('Admin users - KV users count:', kvUsers.length);
    console.log('Admin users - KV users data:', JSON.stringify(kvUsers, null, 2));
    
    const kvUsersMap = new Map();
    kvUsers.forEach((kvUser: any) => {
      console.log('Admin users - Mapping KV user:', kvUser.id, 'Progress:', kvUser.progress);
      kvUsersMap.set(kvUser.id, kvUser);
    });

    const allUsers = authUsers?.users.map((authUser: any) => {
      const kvUser = kvUsersMap.get(authUser.id);
      console.log('Admin users - Auth user:', authUser.id, 'Has KV data:', !!kvUser);
      
      if (kvUser) {
        console.log('Admin users - KV user progress:', kvUser.progress);
      }
      
      return {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || kvUser?.name || 'Без імені',
        tier: authUser.user_metadata?.tier || kvUser?.tier,
        payment_status: authUser.user_metadata?.payment_status || kvUser?.payment_status || 'pending',
        progress: kvUser?.progress || [],
        created_at: authUser.created_at || kvUser?.created_at,
        payment_date: authUser.user_metadata?.payment_date || kvUser?.payment_date,
        project: authUser.user_metadata?.project,
      };
    }) || [];
    
    const adventUsers = allUsers.filter((u: any) => u.project === 'advent-calendar');
    console.log('Admin users - Advent users:', adventUsers.length);
    
    return c.json({ users: adventUsers });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Admin: Update user
app.put('/make-server-dc8cbf1f/admin/users/:userId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if ((user?.email || '').toLowerCase().trim() !== 'katywenka@gmail.com') {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    const userId = c.req.param('userId');
    const body = await c.req.json();

    const userData = await kv.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedData = {
      ...userData,
      ...body,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedData);

    if (body.tier || body.payment_status) {
      const supabase = getSupabase();
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...userData,
          ...body,
        }
      });
    }

    return c.json({ success: true, user: updatedData });
  } catch (error) {
    console.error('Admin user update error:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Mount WayForPay routes
app.route("/make-server-dc8cbf1f", wayforpayRoutes);

// Mount Email routes
app.route("/make-server-dc8cbf1f", emailRoutes);

// 🧪 DEBUG: Test KV store format
app.post("/make-server-dc8cbf1f/test-kv-format", async (c) => {
  try {
    console.log('=== KV FORMAT TEST ===');
    
    const testData = {
      id: 'test-123',
      email: 'test@example.com',
      name: 'Test User',
      progress: [1, 2, 3],
      tier: 'basic'
    };
    
    console.log('Test data type:', typeof testData);
    console.log('Test data:', testData);
    
    // Test write
    await kv.set('test:kv-format', testData);
    console.log('✅ KV set complete');
    
    // Test read
    const retrieved = await kv.get('test:kv-format');
    console.log('Retrieved type:', typeof retrieved);
    console.log('Retrieved data:', retrieved);
    
    // Cleanup
    await kv.del('test:kv-format');
    
    return c.json({ 
      success: true,
      original: testData,
      retrieved: retrieved,
      types: {
        original: typeof testData,
        retrieved: typeof retrieved
      }
    });
  } catch (error) {
    console.error('KV test error:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);