import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Fallback placeholders allow the app to build without env vars set.
  // Real values must be configured in .env.local or Vercel environment settings.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';
  return createBrowserClient(url, key);
}
