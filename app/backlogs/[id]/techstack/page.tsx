import { redirect, notFound } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import TechStackSuggestions from '@/components/tech-stack-suggestions'

interface TechStackPageProps {
  params: Promise<{ id: string }>
}

export default async function TechStackPage({ params }: TechStackPageProps) {
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
        <h1 className="text-2xl font-bold">Tech Stack Recommendations</h1>
        <p className="text-muted-foreground">
          Get AI-powered technology recommendations based on your project requirements and user stories.
        </p>
      </div>
      
      <TechStackSuggestions backlogId={backlog.id} />
    </div>
  )
} 