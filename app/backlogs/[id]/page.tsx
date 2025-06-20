import { redirect, notFound } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import BacklogView from '@/components/backlog-view'
import AppHeader from '@/components/app-header'

interface BacklogPageProps {
  params: { id: string }
}

export default async function BacklogPage({ params }: BacklogPageProps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppHeader user={user} />
      <div className="container mx-auto px-4 py-8">
        <BacklogView backlog={backlog} user={user} />
      </div>
    </div>
  )
} 