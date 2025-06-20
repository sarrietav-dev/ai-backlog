import { redirect, notFound } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import AllTasksView from '@/components/all-tasks-view'

interface TasksPageProps {
  params: Promise<{ id: string }>
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch the specific backlog
  const { data: backlog, error } = await supabase
    .from('backlogs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !backlog) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">All Tasks</h1>
        <p className="text-muted-foreground">
          View and manage all development tasks across your user stories in one place.
        </p>
      </div>
      
      <AllTasksView backlog={backlog} user={user} />
    </div>
  )
} 