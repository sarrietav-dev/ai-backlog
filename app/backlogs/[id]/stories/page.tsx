import { redirect, notFound } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import StoryManager from '@/components/story-manager'

interface StoriesPageProps {
  params: Promise<{ id: string }>
}

export default async function StoriesPage({ params }: StoriesPageProps) {
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
        <h1 className="text-2xl font-bold">User Stories</h1>
        <p className="text-muted-foreground">
          Create, manage, and track user stories for your project. Generate AI-powered stories and break them down into actionable tasks.
        </p>
      </div>
      
      <StoryManager user={user} backlog={backlog} />
    </div>
  )
} 