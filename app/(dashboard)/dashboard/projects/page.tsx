import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProjectTable } from '@/components/projects/ProjectTable'
import type { Project, Client } from '@/types'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [projectsRes, clientsRes] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('*')
      .eq('user_id', user!.id)
      .order('name'),
  ])

  return (
    <ProjectTable
      projects={(projectsRes.data ?? []) as Project[]}
      clients={(clientsRes.data ?? []) as Client[]}
    />
  )
}
