import { createClient } from '@supabase/supabase-js'

// 1. Fetching our hidden credentials from the vault (.env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 2. Establishing the persistent connection client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
