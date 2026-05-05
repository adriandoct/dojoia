import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs/server'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Client-side Supabase client
export const supabase = createClientComponentClient<Database>()

// Server-side Supabase client
export const supabaseServer = createServerComponentClient<Database>({
  cookies: () => cookies(),
})

// Admin client (server only)
export const supabaseAdmin = createServerComponentClient<Database>({
  cookies: () => cookies(),
})