import { redirect, notFound } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import KanbanPage from '@/components/kanban-page'
import AppHeader from '@/components/app-header'

interface KanbanPageProps {
  params: { id: string }
}

export default async function BacklogKanbanPage({ params }: KanbanPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch the specific backlog
  const { data: backlog, error } = await supabase
    .from('backlogs')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !backlog) {
    notFound()
  }

  // Fetch user stories for this backlog
  const { data: stories, error: storiesError } = await supabase
    .from('user_stories')
    .select('*')
    .eq('backlog_id', backlog.id)
    .order('created_at', { ascending: false })

  if (storiesError) {
    console.error('Error fetching stories:', storiesError)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppHeader user={user} />
      <div className="container mx-auto px-4 py-8">
        <KanbanPage 
          backlog={backlog} 
          stories={stories || []} 
          user={user} 
        />
      </div>
    </div>
  )
} 