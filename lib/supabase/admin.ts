import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
  }

  return createClient(url, process.env.SUPABASE_SECRET_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
