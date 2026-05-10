import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service role key. Bypasses RLS.
// NEVER import this from a Client Component — it would leak the key to the browser.
//
// Lazy initialization so the build doesn't fail when env vars are unset on
// the build machine; we only need them at request time.

let cached: SupabaseClient | null = null;

function build(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!cached) cached = build();
    return Reflect.get(cached, prop, cached);
  },
});
