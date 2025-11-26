import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton instance
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseInstance) {
    const projectUrl = `https://${projectId}.supabase.co`;
    
    try {
      supabaseInstance = createSupabaseClient(projectUrl, publicAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'advent-calendar-auth',
          flowType: 'pkce'
        },
        global: {
          headers: {
            'x-client-info': 'advent-calendar'
          }
        }
      });
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      throw error;
    }
  }
  return supabaseInstance;
}