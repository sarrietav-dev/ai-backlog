import { redirect, notFound } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import StoryModal from '@/components/story-modal'

interface ModalStoryPageProps {
  params: Promise<{ id: string; storyId: string }>
}

export default async function ModalStoryPage({ params }: ModalStoryPageProps) {
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

  return <StoryModal story={story} backlog={backlog} user={user} />
} 