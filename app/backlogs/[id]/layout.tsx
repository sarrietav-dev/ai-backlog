import { redirect, notFound } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import AppHeader from '@/components/app-header'
import BacklogNavigation from '@/components/backlog-navigation'

interface BacklogLayoutProps {
  children: React.ReactNode
  modal: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function BacklogLayout({ 
  children, 
  modal, 
  params 
}: BacklogLayoutProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppHeader user={user} />
      <BacklogNavigation backlog={backlog} />
      <div className="container mx-auto px-4 py-6">
        {children}
        {modal}
      </div>
    </div>
  )
} 