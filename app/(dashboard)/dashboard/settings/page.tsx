import { PageHeader } from '@/components/shared/PageHeader'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import type { Profile } from '@/types'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let profileData = data
  if (!profileData && error?.message?.includes('infinite recursion detected in policy for relation "profiles"')) {
    const supabaseAdmin = createAdminClient()
    const { data: adminProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()
    profileData = adminProfile
  }

  const profile = (profileData ?? {
    id: user.id,
    full_name: '',
    avatar_url: null,
    role: 'user',
    company_name: null,
    company_logo: null,
    address: null,
    tax_rate: 0,
    payment_terms: 'Net 30',
    invoice_notes: null,
    created_at: new Date().toISOString(),
  }) as Profile

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage profile, business defaults, and account security." />
      <SettingsTabs profile={profile} />
    </div>
  )
}
