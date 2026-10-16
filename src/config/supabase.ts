import 'dotenv/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Load .env BEFORE reading process.env. This module is imported by
// index.ts, and ES module imports are evaluated before any code in the
// importing file (including its own dotenv.config() call), so the env
// loader must run here at module scope.

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase()
  return (
    lower.includes('your-project') ||
    lower.includes('placeholder') ||
    lower.includes('example') ||
    value.length < 20
  )
}

let supabase: SupabaseClient
let isConfigured = false

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
} else if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseServiceRoleKey)) {
  console.warn('[Supabase] Placeholder credentials detected. Update .env with real values from Supabase Project Settings > API.')
} else {
  isConfigured = true
  console.log('[Supabase] Client initialized with provided credentials.')
}

// Always create a client — if not configured, use dummy values that will fail gracefully
supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseServiceRoleKey : 'placeholder-key',
  {
    auth: { autoRefreshToken: false, persistSession: false },
  },
)

export { supabase, isConfigured }
export default supabase
