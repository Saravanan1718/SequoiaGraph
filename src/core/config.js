export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
}

/** When false the app falls back to localStorage persistence (dev / demo mode). */
export const isSupabaseConfigured = Boolean(
  config.supabaseUrl && config.supabaseAnonKey,
)
