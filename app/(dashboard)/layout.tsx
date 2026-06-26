import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Toaster } from '@/components/ui/toaster'
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist'
import { getOnboardingProgress } from '@/lib/actions/onboarding'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  let profile = data
  if (!profile && error?.message?.includes('infinite recursion detected in policy for relation "profiles"')) {
    const supabaseAdmin = createAdminClient()
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = adminProfile
  }

  const currentUser = {
    full_name: profile?.full_name ?? null,
    email: user.email ?? '',
    avatar_url: profile?.avatar_url ?? null,
  }

  const onboarding = await getOnboardingProgress()

  return (
    <div className="flex h-screen bg-[#f0f0f0] dark:bg-[#0a0a0a]">
      <Sidebar user={currentUser} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f0f0f0] dark:bg-[#0a0a0a]">
        <Topbar user={currentUser} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 bg-[#f0f0f0] dark:bg-[#0a0a0a]">
          {children}
        </main>
        <MobileNav />
      </div>
      {onboarding && !onboarding.completed_at && (
        <OnboardingChecklist progress={onboarding} />
      )}
      <Toaster />
    </div>
  )
}
