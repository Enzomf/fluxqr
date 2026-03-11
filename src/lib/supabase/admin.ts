import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses all RLS.
 * NEVER import this in Client Components or expose to the browser.
 * Use only in Server Actions and API routes for cross-user operations.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
