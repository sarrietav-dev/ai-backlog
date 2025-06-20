import { createClient } from '@/lib/supabase/server'
import AuthButton from '@/components/auth/auth-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Brain, Lightbulb, Kanban, MessageSquare, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Product Backlog</h1>
              <p className="text-sm text-muted-foreground">
                Generate user stories with AI
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthButton user={user} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI-Powered Product Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Create multiple product backlogs, chat with AI about your ideas, and generate 
              contextual user stories. Each backlog maintains its own conversation history and kanban board.
            </p>
          </div>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/backlogs">
                  <FileText className="w-5 h-5" />
                  View My Backlogs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">Sign in to get started with your product backlogs</p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/auth/login">Get Started</Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Contextual AI Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm leading-relaxed">
                Chat with AI about your product ideas. Each backlog remembers your conversation history.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lightbulb className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Smart Story Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm leading-relaxed">
                Generate well-structured user stories with acceptance criteria based on your product context.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <Kanban className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Visual Kanban Boards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm leading-relaxed">
                Track progress with beautiful kanban boards. Drag and drop stories between columns.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-lg">Tech Stack Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm leading-relaxed">
                Get AI-powered technology recommendations tailored to your user stories and project requirements.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="text-center py-16 space-y-6">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-2xl font-bold mb-4">Ready to streamline your product management?</h3>
                <p className="text-muted-foreground mb-6">
                  Join today and start creating better user stories with the power of AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/auth/sign-up">Sign Up Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">Next.js</span>
                <span>•</span>
                <span className="font-medium">Supabase</span>
                <span>•</span>
                <span className="font-medium">OpenAI</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate better user stories and get tech stack recommendations with AI-powered product management
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
