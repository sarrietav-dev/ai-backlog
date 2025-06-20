import { createClient } from '@/lib/supabase/server'
import AuthButton from '@/components/auth/auth-button'
import StoryManager from '@/components/story-manager'
import { ThemeToggle } from '@/components/theme-toggle'
import { Brain, Lightbulb } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-6 space-y-8">
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <AuthButton user={user} />
            </div>
          </div>
        </header>

        <main className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                Transform Ideas into User Stories
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Use AI to generate comprehensive user stories for your product backlog. 
                Simply describe your idea and get professional, well-structured stories instantly.
              </p>
            </div>
          </div>

          {/* Story Manager - handles both generation and display */}
          <StoryManager user={user} />

          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-8 py-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">AI-Generated</h3>
              <p className="text-sm text-muted-foreground">
                Powered by GPT-4 to create comprehensive, well-structured user stories
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">MVP Focused</h3>
              <p className="text-sm text-muted-foreground">
                Stories prioritized for minimum viable product development
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Built with Next.js, Supabase, and OpenAI • Generate better user stories with AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
