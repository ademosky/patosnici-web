import { createClient } from "@supabase/supabase-js";

/**
 * Server-side ONLY Supabase client using the service_role key.
 *
 * The service_role key bypasses Row Level Security, so it is used exclusively
 * in admin API route handlers (which already require the x-admin-password
 * header). It is never imported by client components, and the key itself must
 * never be exposed to the browser (do NOT prefix it with NEXT_PUBLIC_).
 *
 * (Redeploy marker v2)
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
