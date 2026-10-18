import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Without Supabase settings the site runs in demo mode: sample catalogue, and accounts,
// cart and orders kept in this browser's localStorage.
export const isDemo = !url || !anonKey;

export const supabase: SupabaseClient | null = isDemo
  ? null
  : createClient(url!, anonKey!, {
      auth: { persistSession: typeof window !== "undefined", autoRefreshToken: typeof window !== "undefined" },
    });
