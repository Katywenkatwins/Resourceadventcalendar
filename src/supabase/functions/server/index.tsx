import { Hono } from 'npm:hono@4.6.14';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import * as kv from './kv_store.tsx';
import wayforpayRoutes from './wayforpay.tsx';
import emailRoutes from './email.tsx';
import dayContentRoutes from './day-content.tsx';
import { migrateUserData } from './migrate-users.tsx';

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Create Supabase client with anon key
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};

// Helper to verify user from token
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Health check endpoint
app.get("/make-server-dc8cbf1f/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    project: "advent-calendar-2024" 
  });
});

// Sign up endpoint
app.post("/make-server-dc8cbf1f/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Перевіряємо чи користувач вже існує
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      // Перевіряємо чи це користувач адвент-календаря
      const isAdventUser = existingUser.user_metadata?.project === 'advent-calendar';
      
      if (isAdventUser) {
        return c.json({ error: 'A user with this email address has already been registered' }, 400);
      } else {
        // Користувач з іншого проєкту - можемо перезаписати або повернути помилку
        console.log('User exists in another project:', email);
        return c.json({ error: 'Email already registered in another project. Please use a different email or contact support.' }, 400);
      }
    }
    
    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since email server hasn't been configured
      user_metadata: {
        name,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        project: 'advent-calendar', // Маркер проєкту для фільтрації
      }
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user data in KV
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
      
      // Send welcome email (non-blocking)
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const baseUrl = supabaseUrl.replace('https://', '').replace('http://', '');
      
      fetch(`https://${baseUrl}/functions/v1/make-server-dc8cbf1f/email/send-welcome`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({ email, name })
      }).catch(err => console.error('Failed to send welcome email:', err));
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

// Confirm payment endpoint (after WayforPay callback)
app.post("/make-server-dc8cbf1f/confirm-payment", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { tier, transaction_id } = body;

    if (!tier) {
      return c.json({ error: 'Tier is required' }, 400);
    }

    // Update user data
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      await kv.set(`user:${user.id}`, {
        ...userData,
        tier,
        payment_status: 'paid',
        transaction_id,
        payment_date: new Date().toISOString(),
      });
    }

    // Update Supabase auth metadata
    const supabase = getSupabaseAdmin();
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        tier,
        payment_status: 'paid',
        transaction_id,
        payment_date: new Date().toISOString(),
      }
    });

    return c.json({ success: true, tier });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return c.json({ error: 'Failed to confirm payment' }, 500);
  }
});

// Get user profile
app.get("/make-server-dc8cbf1f/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    const user = await verifyUser(authHeader);
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
app.post("/make-server-dc8cbf1f/progress", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { day } = body;

    if (!day || day < 1 || day > 24) {
      return c.json({ error: 'Invalid day' }, 400);
    }

    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      // Створюємо нові дані користувача, якщо їх немає
      const newUserData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        tier: user.user_metadata?.tier || 'basic',
        payment_status: user.user_metadata?.payment_status || 'pending',
        progress: [day],
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      };
      
      await kv.set(`user:${user.id}`, newUserData);
      
      return c.json({ success: true, progress: newUserData.progress });
    }

    const progress = userData.progress || [];
    if (!progress.includes(day)) {
      progress.push(day);
      progress.sort((a: number, b: number) => a - b);
    }

    const updatedData = {
      ...userData,
      progress,
      last_activity: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, updatedData);

    return c.json({ success: true, progress });
  } catch (error) {
    console.error('Progress update error:', error);
    return c.json({ error: 'Failed to update progress' }, 500);
  }
});

// Check if day is accessible
app.get("/make-server-dc8cbf1f/check-day/:day", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const day = parseInt(c.req.param('day'));
    if (!day || day < 1 || day > 24) {
      return c.json({ error: 'Invalid day' }, 400);
    }

    // Check if user is admin
    const isAdmin = user.email?.toLowerCase() === 'katywenka@gmail.com';
    
    // Get calendar settings - використовуємо правильний ключ
    const calendarConfig = await kv.get('calendar:config');
    const startDate = calendarConfig?.startDate ? new Date(calendarConfig.startDate) : new Date(2024, 10, 15); // 15 листопада за замовчуванням
    const manuallyUnlockedDays = calendarConfig?.manuallyUnlockedDays || [];
    
    console.log('Check day access:', { day, isAdmin, manuallyUnlockedDays, startDate });
    
    // Get user data
    const userData = await kv.get(`user:${user.id}`);
    const progress = userData?.progress || [];
    
    const today = new Date();
    const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check if day is accessible
    let isAccessible = false;
    let reason = '';
    
    // Admin always has access
    if (isAdmin) {
      isAccessible = true;
      reason = 'admin';
    }
    // ТІЛЬКИ вручну розблоковані дні доступні для звичайних користувачів
    else if (manuallyUnlockedDays.includes(day)) {
      isAccessible = true;
      reason = 'manually_unlocked';
    }
    // Всі інші дні заблоковані
    else {
      isAccessible = false;
      reason = 'day_locked';
    }
    
    return c.json({ 
      accessible: isAccessible, 
      reason,
      daysPassed,
      progress,
      startDate: startDate.toISOString(),
      manuallyUnlockedDays // для дебагу
    });
  } catch (error) {
    console.error('Check day error:', error);
    return c.json({ error: 'Failed to check day accessibility' }, 500);
  }
});

// Get list of unlocked days (for all users)
app.get("/make-server-dc8cbf1f/unlocked-days", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get calendar config from KV
    const calendarConfig = await kv.get('calendar:config');
    const manuallyUnlockedDays = calendarConfig?.manuallyUnlockedDays || [];
    
    console.log('Unlocked days requested:', manuallyUnlockedDays);

    return c.json({ 
      days: manuallyUnlockedDays
    });
  } catch (error) {
    console.error('Get unlocked days error:', error);
    return c.json({ error: 'Failed to get unlocked days' }, 500);
  }
});

// ADMIN: Migrate user data
app.post("/make-server-dc8cbf1f/migrate-users", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    const userEmail = (user?.email || '').toLowerCase().trim();
    const adminEmail = 'katywenka@gmail.com';
    
    if (!user || userEmail !== adminEmail) {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    console.log('Starting user migration...');
    const result = await migrateUserData();
    
    return c.json(result);
  } catch (error) {
    console.error('Migration endpoint error:', error);
    return c.json({ error: 'Failed to run migration' }, 500);
  }
});

// Admin: Get all users
app.get("/make-server-dc8cbf1f/admin/users", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    const userEmail = (user?.email || '').toLowerCase().trim();
    const adminEmail = 'katywenka@gmail.com';
    
    console.log('Admin check - User email:', user?.email, 'Normalized:', userEmail, 'Is admin:', userEmail === adminEmail);
    
    if (!user || userEmail !== adminEmail) {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    // Get all users from Supabase Auth
    const supabase = getSupabaseAdmin();
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return c.json({ error: 'Failed to fetch auth users' }, 500);
    }

    // Get all users from KV store
    const kvUsers = await kv.getByPrefix('user:');
    
    // Create a map of KV users by ID for quick lookup
    const kvUsersMap = new Map();
    kvUsers.forEach((kvUser: any) => {
      kvUsersMap.set(kvUser.id, kvUser);
    });

    // Merge auth users with KV data
    const allUsers = authUsers.users.map((authUser: any) => {
      const kvUser = kvUsersMap.get(authUser.id);
      
      return {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || kvUser?.name || 'Без імені',
        tier: authUser.user_metadata?.tier || kvUser?.tier,
        payment_status: authUser.user_metadata?.payment_status || kvUser?.payment_status || 'pending',
        progress: kvUser?.progress || [],
        created_at: authUser.created_at || kvUser?.created_at,
        payment_date: authUser.user_metadata?.payment_date || kvUser?.payment_date,
        project: authUser.user_metadata?.project, // Додаємо маркер проєкту
      };
    });
    
    // Фільтруємо тільки користувачів адвент-календаря
    const adventUsers = allUsers.filter((u: any) => u.project === 'advent-calendar');
    
    console.log('Admin fetched users:', allUsers.length, 'Advent users:', adventUsers.length);
    return c.json({ users: adventUsers });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return c.json({ error: `Failed to fetch users: ${error.message}` }, 500);
  }
});

// Admin: Update user
app.put("/make-server-dc8cbf1f/admin/users/:userId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    const userEmail = (user?.email || '').toLowerCase().trim();
    const adminEmail = 'katywenka@gmail.com';
    
    if (!user || userEmail !== adminEmail) {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    const userId = c.req.param('userId');
    const body = await c.req.json();

    const userData = await kv.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update user data
    const updatedData = {
      ...userData,
      ...body,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedData);

    // Also update Supabase auth metadata if tier or payment_status changed
    if (body.tier || body.payment_status) {
      const supabase = getSupabaseAdmin();
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

// Admin: Delete user
app.delete("/make-server-dc8cbf1f/admin/users/:userId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    const userEmail = (user?.email || '').toLowerCase().trim();
    const adminEmail = 'katywenka@gmail.com';
    
    if (!user || userEmail !== adminEmail) {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    const userId = c.req.param('userId');

    // Delete from KV store
    await kv.del(`user:${userId}`);

    // Delete from Supabase auth
    const supabase = getSupabaseAdmin();
    await supabase.auth.admin.deleteUser(userId);

    return c.json({ success: true });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Admin: Mark user as advent-calendar user
app.post("/make-server-dc8cbf1f/admin/mark-advent-user/:userId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    const userEmail = (user?.email || '').toLowerCase().trim();
    const adminEmail = 'katywenka@gmail.com';
    
    if (!user || userEmail !== adminEmail) {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    const userId = c.req.param('userId');
    const supabase = getSupabaseAdmin();
    
    // Get user data
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !userData.user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update user metadata with project marker
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        project: 'advent-calendar',
      }
    });

    return c.json({ success: true, message: 'User marked as advent-calendar user' });
  } catch (error) {
    console.error('Mark advent user error:', error);
    return c.json({ error: 'Failed to mark user' }, 500);
  }
});

// Admin: Get calendar config
app.get("/make-server-dc8cbf1f/admin/calendar-config", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    const userEmail = (user?.email || '').toLowerCase().trim();
    const adminEmail = 'katywenka@gmail.com';
    
    if (!user || userEmail !== adminEmail) {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    // Get calendar config from KV
    const config = await kv.get('calendar:config');
    
    // Default config if not exists
    const defaultConfig = {
      startDate: '2024-12-01',
      manuallyUnlockedDays: [],
    };

    return c.json({ 
      config: config || defaultConfig 
    });
  } catch (error) {
    console.error('Get calendar config error:', error);
    return c.json({ error: 'Failed to get calendar config' }, 500);
  }
});

// Admin: Save calendar config
app.post("/make-server-dc8cbf1f/admin/calendar-config", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    const userEmail = (user?.email || '').toLowerCase().trim();
    const adminEmail = 'katywenka@gmail.com';
    
    if (!user || userEmail !== adminEmail) {
      return c.json({ error: 'Unauthorized - Admin only' }, 403);
    }

    const body = await c.req.json();
    const { config } = body;

    if (!config) {
      return c.json({ error: 'Config is required' }, 400);
    }

    // Save to KV
    await kv.set('calendar:config', config);
    
    console.log('Calendar config saved:', config);

    return c.json({ success: true, config });
  } catch (error) {
    console.error('Save calendar config error:', error);
    return c.json({ error: 'Failed to save calendar config' }, 500);
  }
});

// Mount WayForPay routes with prefix
app.route("/make-server-dc8cbf1f", wayforpayRoutes);

// Mount Email routes with prefix
app.route("/make-server-dc8cbf1f", emailRoutes);

// Mount Day Content routes with prefix
app.route("/make-server-dc8cbf1f/content", dayContentRoutes);

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