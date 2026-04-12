'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { loginSchema, signupSchema } from '@/lib/validations/auth'
import { redirect } from 'next/navigation'

export async function loginAction(formData: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(formData)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { data: null, error: error.message }
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const destination = profile?.role === 'admin' ? '/admin' : '/dashboard'
  redirect(destination)
}

export async function signupAction(formData: {
  full_name: string
  email: string
  password: string
  confirm_password: string
}) {
  const parsed = signupSchema.safeParse(formData)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
      },
    },
  })

  if (error) {
    return { data: null, error: error.message }
  }

  // Supabase returns a user with identities=[] when the email already exists
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { data: null, error: 'An account with this email already exists. Please log in instead.' }
  }

  return { data: { emailSent: true }, error: null }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
