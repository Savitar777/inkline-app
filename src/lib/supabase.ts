import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * `true` when Supabase environment variables are not set or are obviously
 * placeholder values.  The rest of the app uses this to skip network calls
 * and run in offline / localStorage-only mode.
 */
export const isSupabaseConfigured: boolean = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    'Supabase env vars missing or placeholder — running in offline/mock mode.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to connect.',
  )
}

// Create a real client only when configured; otherwise provide a dummy that
// will never be used (all call-sites guard on isSupabaseConfigured).
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createClient('https://placeholder.supabase.co', 'placeholder')
