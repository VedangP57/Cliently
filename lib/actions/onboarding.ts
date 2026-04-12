'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { OnboardingProgress } from '@/types'

export type OnboardingStep = keyof Pick<
  OnboardingProgress,
  'has_completed_profile' | 'has_added_client' | 'has_created_project' | 'has_logged_time' | 'has_created_invoice'
>

export async function getOnboardingProgress(): Promise<OnboardingProgress | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('onboarding_progress')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data as OnboardingProgress | null
}

export async function updateOnboardingStep(step: OnboardingStep, value: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const admin = createAdminClient()

  const { data: progress } = await admin
    .from('onboarding_progress')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!progress || progress.completed_at) return

  await admin
    .from('onboarding_progress')
    .update({ [step]: value })
    .eq('user_id', user.id)
}

export async function dismissOnboarding() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('onboarding_progress')
    .update({ completed_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { error: null }
}
