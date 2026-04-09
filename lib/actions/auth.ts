'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth'
import { redirect } from 'next/navigation'

export async function loginAction(formData: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(formData)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { data: null, error: error.message }
  }

  redirect('/dashboard')
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
  const { error } = await supabase.auth.signUp({
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

  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
