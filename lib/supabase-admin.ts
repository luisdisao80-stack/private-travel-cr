import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service role key. Bypasses RLS.
// NEVER import this from a Client Component — it would leak the key to the browser.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  // Fail at construction so a misconfigured deploy surfaces immediately.
  // The unset condition is checked on every import; throwing avoids silent NULL fields.
  throw new Error(
    "Missing Supabase admin env vars: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
