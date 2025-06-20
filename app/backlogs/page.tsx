import { redirect } from "next/navigation"
import { createClient } from '@/lib/supabase/server'
import BacklogsList from '@/components/backlogs-list'
import AppHeader from '@/components/app-header'

export default async function BacklogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppHeader user={user} />
      <div className="container mx-auto px-4 py-8">
        <BacklogsList user={user} />
      </div>
    </div>
  )
} 