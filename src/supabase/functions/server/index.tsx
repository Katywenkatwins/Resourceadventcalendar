import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

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
    console.log('verifyUser - No auth header');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('verifyUser - No token in header');
    return null;
  }

  console.log('verifyUser - Token:', token.substring(0, 20) + '...');

  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error) {
    console.log('verifyUser - Auth error:', error.message);
    return null;
  }
  
  if (!user) {
    console.log('verifyUser - No user found');
    return null;
  }
  
  console.log('verifyUser - User verified:', user.id, user.email);
  return user;
}

// Health check endpoint
app.get("/make-server-dc8cbf1f/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-dc8cbf1f/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, tier = 'basic' } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since email server hasn't been configured
      user_metadata: {
        name,
        tier,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
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
        tier,
        payment_status: 'pending',
        progress: [],
        created_at: new Date().toISOString(),
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
    console.log('Profile request - Auth header present:', !!authHeader);
    
    const user = await verifyUser(authHeader);
    if (!user) {
      console.log('Profile request - User verification failed');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('Profile request - User verified:', user.id);

    const userData = await kv.get(`user:${user.id}`);
    console.log('Profile request - KV data:', userData);
    
    const profile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || userData?.name || '',
      tier: user.user_metadata?.tier || userData?.tier || 'basic',
      payment_status: user.user_metadata?.payment_status || userData?.payment_status || 'pending',
      progress: userData?.progress || [],
      created_at: userData?.created_at,
      payment_date: user.user_metadata?.payment_date || userData?.payment_date,
    };

    console.log('Profile request - Returning profile:', profile);
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
      return c.json({ error: 'User data not found' }, 404);
    }

    const progress = userData.progress || [];
    if (!progress.includes(day)) {
      progress.push(day);
      progress.sort((a: number, b: number) => a - b);
    }

    await kv.set(`user:${user.id}`, {
      ...userData,
      progress,
      last_activity: new Date().toISOString(),
    });

    return c.json({ success: true, progress });
  } catch (error) {
    console.error('Progress update error:', error);
    return c.json({ error: 'Failed to update progress' }, 500);
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

    // Get all users from KV store
    const allUsers = await kv.getByPrefix('user:');
    
    console.log('Admin fetched users:', allUsers.length);
    return c.json({ users: allUsers });
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

Deno.serve(app.fetch);