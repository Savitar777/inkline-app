import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const hasConfiguredSupabaseUrl = !!(supabaseUrl && !supabaseUrl.includes('placeholder'))
const hasConfiguredSupabaseAnonKey = !!(supabaseAnonKey && !supabaseAnonKey.includes('placeholder'))

/**
 * `true` when Supabase environment variables are not set or are obviously
 * placeholder values.  The rest of the app uses this to skip network calls
 * and run in offline / localStorage-only mode.
 */
export const isSupabaseConfigured: boolean = hasConfiguredSupabaseUrl && hasConfiguredSupabaseAnonKey
export const backendMode: 'supabase' | 'offline' = isSupabaseConfigured ? 'supabase' : 'offline'
export const backendModeDescription = isSupabaseConfigured
  ? 'Supabase-backed auth, realtime collaboration, and storage are enabled.'
  : 'Offline mode is active because VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are missing or still set to placeholder values. Data stays in localStorage on this device until Supabase is configured.'

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    `${backendModeDescription}\n` +
    'Copy .env.example to .env.local and set both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect.',
  )
}

// Create a real client only when configured; otherwise provide a dummy that
// will never be used (all call-sites guard on isSupabaseConfigured).
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createClient('https://placeholder.supabase.co', 'placeholder')
