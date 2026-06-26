import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Toaster } from '@/components/ui/toaster'

export default async function AdminLayout({
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
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  let profile = data
  if (!profile && error?.message?.includes('infinite recursion detected in policy for relation "profiles"')) {
    const supabaseAdmin = createAdminClient()
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()
    profile = adminProfile
  }

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const currentUser = {
    full_name: profile?.full_name ?? null,
    email: user.email ?? '',
    avatar_url: profile?.avatar_url ?? null,
  }

  return (
    <div className="flex h-screen bg-[#f0f0f0] dark:bg-[#0a0a0a] p-2 gap-2">
      <Sidebar user={currentUser} variant="admin" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar user={currentUser} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
