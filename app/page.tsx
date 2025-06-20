import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import AuthButton from '@/components/auth/auth-button'
import StoryGenerator from '@/components/story-generator'
import StoriesTable from '@/components/stories-table'
import { ThemeToggle } from '@/components/theme-toggle'
import { Brain, Lightbulb } from 'lucide-react'

async function UserStories({ userId }: { userId: string }) {
  const supabase = await createClient()
  
  const { data: stories, error } = await supabase
    .from('user_stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stories:', error)
    return <div>Error loading stories</div>
  }

  return <StoriesTable stories={stories || []} />
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
              <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Product Backlog</h1>
                <p className="text-sm text-muted-foreground">
                  Generate user stories with AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AuthButton user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
              <Lightbulb className="w-4 h-4" />
              AI-Powered Product Management
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              Transform Ideas into{' '}
              <span className="text-primary">User Stories</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Describe your product vision and get a comprehensive backlog of 
              well-structured user stories in seconds.
            </p>
          </div>

          {/* Story Generator */}
          <StoryGenerator 
            user={user} 
          />

          {/* User Stories Table (only show if user is authenticated) */}
          {user && (
            <div className="space-y-4">
              <Suspense 
                fallback={
                  <div className="animate-pulse">
                    <div className="h-64 bg-muted rounded-lg"></div>
                  </div>
                }
              >
                <UserStories userId={user.id} />
              </Suspense>
            </div>
          )}

          {/* CTA for non-authenticated users */}
          {!user && (
            <div className="text-center py-8 space-y-4">
              <div className="p-6 border-2 border-dashed border-primary/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  Save Your Stories
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sign in to save generated stories to your personal backlog and manage them over time.
                </p>
                <AuthButton user={user} />
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 py-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg mx-auto flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">AI-Generated</h3>
              <p className="text-sm text-muted-foreground">
                Powered by GPT-4 to create comprehensive, well-structured user stories
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg mx-auto flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">MVP Focused</h3>
              <p className="text-sm text-muted-foreground">
                Stories prioritized for minimum viable product development
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg mx-auto flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Ready to Use</h3>
              <p className="text-sm text-muted-foreground">
                Complete with acceptance criteria and actionable descriptions
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 AI Product Backlog. Built with Next.js, Supabase & OpenAI.</p>
            <p>Open source on GitHub</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
