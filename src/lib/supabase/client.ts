import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

// CLIENT ONLY
export const supabase = createClientComponentClient<Database>()