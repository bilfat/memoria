import { createClient } from '@supabase/supabase-js';

/**
 * createAdminClient (Service Role / Server Privileged Only)
 * Supabase client berkuasa penuh dengan SERVICE_ROLE_KEY.
 * DILARANG digunakan di browser atau Client Component!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in server environment');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

