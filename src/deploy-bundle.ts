// =============================================================================
// BUNDLE FILE FOR MANUAL DEPLOYMENT TO SUPABASE EDGE FUNCTIONS
// =============================================================================
// Instructions:
// 1. Go to: https://supabase.com/dashboard/project/rypfeuayzgbpxxkffrao/functions
// 2. Click "Create a new function"
// 3. Name: make-server-dc8cbf1f
// 4. Copy this entire file content
// 5. Deploy
// =============================================================================

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const app = new Hono();

// =============================================================================
// MIDDLEWARE
// =============================================================================

app.use('*', logger(console.log));

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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};

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

// =============================================================================
// KV STORE FUNCTIONS
// =============================================================================

const kvClient = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

const kvSet = async (key: string, value: any): Promise<void> => {
  const supabase = kvClient()
  const { error } = await supabase.from("kv_store_dc8cbf1f").upsert({
    key,
    value
  });
  if (error) {
    throw new Error(error.message);
  }
};

const kvGet = async (key: string): Promise<any> => {
  const supabase = kvClient()
  const { data, error } = await supabase.from("kv_store_dc8cbf1f").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};

const kvDel = async (key: string): Promise<void> => {
  const supabase = kvClient()
  const { error } = await supabase.from("kv_store_dc8cbf1f").delete().eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};

const kvGetByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = kvClient()
  const { data, error } = await supabase.from("kv_store_dc8cbf1f").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

// =============================================================================
// EMAIL FUNCTIONS
// =============================================================================

const RESEND_API_KEY = Deno.env.get('ADVENT_RESEND_API_KEY') || Deno.env.get('RESEND_API_KEY') || Deno.env.get('ADVENT-RESEND-API-KEY');

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Адвент-календар <noreply@adventresurs.space>',
        to: [to],
        subject: subject,
        html: html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

function getWelcomeEmailTemplate(name: string, email: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e3a5f; background-color: #e8e4e1;"><div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; padding: 40px;"><h1>✨ Вітаємо в Адвент-календарі!</h1><h2>Привіт, ${name}! 🎄</h2><p>Дякуємо, що приєдналися до проєкту <strong>"24 кроки до нового себе"</strong>!</p><p>Ви успішно зареєструвалися з email: <strong>${email}</strong></p></div></body></html>`;
}

// =============================================================================
// WAYFORPAY FUNCTIONS
// =============================================================================

const MERCHANT_LOGIN = 'adventresurs_space';
const MERCHANT_SECRET_KEY = Deno.env.get('WAYFORPAY_MERCHANT_PASSWORD') || '99a97987a610ae0f7443d490a994e8c9fb211900';

function generateSignature(fields: string[]): string {
  const signatureString = fields.join(';');
  return createHmac('md5', MERCHANT_SECRET_KEY)
    .update(signatureString)
    .digest('hex');
}

// =============================================================================
// ROUTES
// =============================================================================

// Health check
app.get("/make-server-dc8cbf1f/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    project: "advent-calendar-2024" 
  });
});

// Sign up
app.post("/make-server-dc8cbf1f/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      const isAdventUser = existingUser.user_metadata?.project === 'advent-calendar';
      
      if (isAdventUser) {
        return c.json({ error: 'A user with this email address has already been registered' }, 400);
      } else {
        console.log('User exists in another project:', email);
        return c.json({ error: 'Email already registered in another project. Please use a different email or contact support.' }, 400);
      }
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
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    if (data.user) {
      await kvSet(`user:${data.user.id}`, {
        id: data.user.id,
        email,
        name,
        payment_status: 'pending',
        progress: [],
        created_at: new Date().toISOString(),
        project: 'advent-calendar',
      });
      
      fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-dc8cbf1f/send-welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

// Get profile
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

    const userData = await kvGet(`user:${user.id}`);
    console.log('Profile request - KV data:', userData);
    
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

    console.log('Profile request - Returning profile:', profile);
    return c.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Send welcome email
app.post('/make-server-dc8cbf1f/send-welcome', async (c) => {
  try {
    const { email, name } = await c.req.json();
    
    if (!email || !name) {
      return c.json({ error: 'Email and name are required' }, 400);
    }

    const result = await sendEmail(
      email,
      '🎄 Вітаємо в Адвент-календарі трансформації!',
      getWelcomeEmailTemplate(name, email)
    );

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return c.json({ error: 'Failed to send welcome email' }, 500);
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

    const supabase = getSupabaseAdmin();
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return c.json({ error: 'Failed to fetch auth users' }, 500);
    }

    const kvUsers = await kvGetByPrefix('user:');
    
    const kvUsersMap = new Map();
    kvUsers.forEach((kvUser: any) => {
      kvUsersMap.set(kvUser.id, kvUser);
    });

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
        project: authUser.user_metadata?.project,
      };
    });
    
    const adventUsers = allUsers.filter((u: any) => u.project === 'advent-calendar');
    
    console.log('Admin fetched users:', allUsers.length, 'Advent users:', adventUsers.length);
    return c.json({ users: adventUsers });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return c.json({ error: `Failed to fetch users: ${error.message}` }, 500);
  }
});

// =============================================================================
// START SERVER
// =============================================================================

Deno.serve(app.fetch);
