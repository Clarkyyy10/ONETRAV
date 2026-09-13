/**
 * Supabase connection values.
 *
 * Prefer the NEXT_PUBLIC_* environment variables, but fall back to the ONETRAV
 * project's public values so the app runs even when the host has no env vars
 * configured. The publishable (anon) key is designed to be exposed in the
 * browser bundle — Row Level Security is what protects the data, not secrecy
 * of this key.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://fkazqjauivpfoxomfitl.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_fZZ6RNwHD3rBwylrVJquqQ_fT-EUdXX";
