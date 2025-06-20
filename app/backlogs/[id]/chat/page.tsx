import { redirect, notFound } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import ChatInterface from '@/components/chat-interface'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
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
        <h1 className="text-2xl font-bold">AI Chat Assistant</h1>
        <p className="text-muted-foreground">
          Brainstorm ideas, refine requirements, and get AI-powered insights for your project.
        </p>
      </div>
      
      <ChatInterface backlog={backlog} user={user} />
    </div>
  )
} 