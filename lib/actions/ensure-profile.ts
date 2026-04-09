'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Ensures a row in `public.profiles` exists for the given auth user.
 * We use the Admin Client here to bypass RLS, ensuring the profile row
 * is created even if the user lacks INSERT permissions or the DB trigger failed.
 */
export async function ensureProfile(user: {
  id: string
  user_metadata?: Record<string, unknown>
}) {
  const supabaseAdmin = createAdminClient()

  await supabaseAdmin.from('profiles').upsert(
    {
      id: user.id,
      full_name: (user.user_metadata?.full_name as string) ?? null,
      avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )
}
