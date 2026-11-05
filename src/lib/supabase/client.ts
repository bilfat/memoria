import { createBrowserClient } from '@supabase/ssr';

/**
 * createClient
 * Supabase client aman untuk Client Components / Browser execution.
 * Menggunakan publishable anon key dengan cookie management terintegrasi SSR.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

