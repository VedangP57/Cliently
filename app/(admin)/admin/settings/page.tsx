import { PageHeader } from '@/components/shared/PageHeader'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import type { Profile } from '@/types'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const admin = createAdminClient()
  const { data: profileData } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = (profileData ?? {
    id: user.id,
    full_name: '',
    avatar_url: null,
    role: 'admin',
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
