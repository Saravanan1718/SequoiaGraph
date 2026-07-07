import { createClient } from '@supabase/supabase-js'
import { config, isSupabaseConfigured } from '@/core/config'

/** The single Supabase client. Null when env vars are missing (local mode). */
export const supabase = isSupabaseConfigured
  ? createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null
