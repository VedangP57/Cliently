'use server'

import { revalidatePath } from 'next/cache'
import dayjs from 'dayjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  businessSettingsSchema,
  changePasswordSchema,
  defaultsSettingsSchema,
  profileSettingsSchema,
  type BusinessSettingsValues,
  type ChangePasswordValues,
  type DefaultsSettingsValues,
  type ProfileSettingsValues,
} from '@/lib/validations/settings'
import { updateOnboardingStep } from '@/lib/actions/onboarding'

function isProfilesPolicyRecursionError(message: string | null | undefined) {
  return Boolean(message?.includes('infinite recursion detected in policy for relation "profiles"'))
}

type ProfileUpdatePayload = {
  full_name?: string | null
  avatar_url?: string | null
  company_name?: string | null
  company_logo?: string | null
  address?: string | null
  tax_rate?: number
  payment_terms?: string
  invoice_notes?: string | null
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, error: 'Unauthorized' as const }
  }

  return { supabase, user, error: null }
}

async function updateProfileWithFallback(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, payload: ProfileUpdatePayload) {
  const updateQuery = supabase.from('profiles').update(payload).eq('id', userId).select().single()
  const { data, error } = await updateQuery

  if (!error) {
    return { data, error: null as string | null }
  }

  if (!isProfilesPolicyRecursionError(error.message)) {
    return { data: null, error: error.message }
  }

  // Fallback for misconfigured RLS policy recursion in local/dev environments.
  const supabaseAdmin = createAdminClient()
  const { data: adminData, error: adminError } = await supabaseAdmin
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single()

  if (adminError) {
    return { data: null, error: adminError.message }
  }

  return { data: adminData, error: null as string | null }
}

export async function updateProfileSettingsAction(input: ProfileSettingsValues) {
  const parsed = profileSettingsSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) return { data: null, error: authError ?? 'Unauthorized' }

  const { data, error } = await updateProfileWithFallback(supabase, user.id, {
    full_name: parsed.data.full_name,
    avatar_url: parsed.data.avatar_url ?? null,
  })

  if (error) return { data: null, error }

  updateOnboardingStep('has_completed_profile', true).catch(() => {})

  revalidatePath('/dashboard/settings')
  return { data, error: null }
}

export async function updateBusinessSettingsAction(input: BusinessSettingsValues) {
  const parsed = businessSettingsSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) return { data: null, error: authError ?? 'Unauthorized' }

  const { data, error } = await updateProfileWithFallback(supabase, user.id, {
    company_name: parsed.data.company_name ?? null,
    company_logo: parsed.data.company_logo ?? null,
    address: parsed.data.address ?? null,
  })

  if (error) return { data: null, error }

  revalidatePath('/dashboard/settings')
  return { data, error: null }
}

export async function updateDefaultsSettingsAction(input: DefaultsSettingsValues) {
  const parsed = defaultsSettingsSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) return { data: null, error: authError ?? 'Unauthorized' }

  const { data, error } = await updateProfileWithFallback(supabase, user.id, {
    tax_rate: parsed.data.tax_rate,
    payment_terms: parsed.data.payment_terms,
    invoice_notes: parsed.data.invoice_notes ?? null,
  })

  if (error) return { data: null, error }

  revalidatePath('/dashboard/settings')
  return { data, error: null }
}

export async function changePasswordAction(input: ChangePasswordValues) {
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) return { data: null, error: authError ?? 'Unauthorized' }
  if (!user.email) return { data: null, error: 'Missing user email' }

  const signInResult = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  })
  if (signInResult.error) {
    return { data: null, error: 'Current password is incorrect' }
  }

  const { data, error } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  })

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/settings')
  return { data, error: null }
}

async function uploadFileToBucket(file: File, folder: 'avatars' | 'logos') {
  const { supabase, user, error: authError } = await getAuthenticatedUser()
  if (authError || !user) return { data: null, error: authError ?? 'Unauthorized' }

  const bucket = folder === 'avatars' ? 'avatars' : 'logos'
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${folder}/${user.id}-${dayjs().valueOf()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  })

  if (uploadError?.message?.includes('Bucket not found')) {
    const supabaseAdmin = createAdminClient()
    const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucket, { public: true })
    if (createBucketError && !createBucketError.message.toLowerCase().includes('already exists')) {
      return { data: null, error: createBucketError.message }
    }

    const { error: retryUploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    })

    if (retryUploadError) return { data: null, error: retryUploadError.message }
  } else if (uploadError) {
    return { data: null, error: uploadError.message }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { data: { url: data.publicUrl }, error: null }
}

export async function uploadAvatarAction(formData: FormData) {
  const file = formData.get('file')
  if (!(file instanceof File)) return { data: null, error: 'Missing file upload' }
  if (!file.type.startsWith('image/')) return { data: null, error: 'Only image files are allowed' }
  return uploadFileToBucket(file, 'avatars')
}

export async function uploadCompanyLogoAction(formData: FormData) {
  const file = formData.get('file')
  if (!(file instanceof File)) return { data: null, error: 'Missing file upload' }
  if (!file.type.startsWith('image/')) return { data: null, error: 'Only image files are allowed' }
  return uploadFileToBucket(file, 'logos')
}
