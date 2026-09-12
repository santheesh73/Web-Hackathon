import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return (
    typeof supabaseUrl === 'string' &&
    typeof supabaseAnonKey === 'string' &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
}

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      supabaseUrl || 'https://demo.supabase.co',
      supabaseAnonKey || 'demo-anon-key'
    );
  }
  return client;
}
