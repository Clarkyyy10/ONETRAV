import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";

/**
 * Server-side Supabase client bound to the request cookies.
 * Use inside Server Components, Server Actions, and Route Handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; safe to ignore because the
            // middleware refreshes the session cookie on every request.
          }
        },
      },
    },
  );
}
