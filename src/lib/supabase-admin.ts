import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side ONLY Supabase client using the service_role key.
 *
 * The service_role key bypasses Row Level Security, so it is used exclusively
 * in admin API route handlers (which already require the x-admin-password
 * header). It is never imported by client components, and the key itself must
 * never be exposed to the browser (do NOT prefix it with NEXT_PUBLIC_).
 */

let _client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      `Missing Supabase admin credentials: url=${!!url} serviceRoleKey=${!!key}`
    );
  }
  _client = createClient(url, key);
  return _client;
}
