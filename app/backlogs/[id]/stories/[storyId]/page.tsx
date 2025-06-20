import { redirect, notFound } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import StoryDetailView from '@/components/story-detail-view'

interface StoryPageProps {
  params: Promise<{ id: string; storyId: string }>
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id: backlogId, storyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch the specific backlog
  const { data: backlog, error: backlogError } = await supabase
    .from('backlogs')
    .select('*')
    .eq('id', backlogId)
    .eq('user_id', user.id)
    .single()

  if (backlogError || !backlog) {
    notFound()
  }

  // Fetch the specific user story
  const { data: story, error: storyError } = await supabase
    .from('user_stories')
    .select('*')
    .eq('id', storyId)
    .eq('backlog_id', backlogId)
    .eq('user_id', user.id)
    .single()

  if (storyError || !story) {
    notFound()
  }

  return <StoryDetailView story={story} backlog={backlog} user={user} />
} 