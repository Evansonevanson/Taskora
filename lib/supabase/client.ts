import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export type TypedBrowserClient = ReturnType<
  typeof createBrowserClient<Database>
>;

let browserClient: TypedBrowserClient | undefined;

export function createClient(): TypedBrowserClient {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.',
    );
  }

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
