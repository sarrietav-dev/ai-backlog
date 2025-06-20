import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AppHeader from '@/components/app-header'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppHeader user={null} />
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-md w-full text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                  <Brain className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Page Not Found</CardTitle>
              <CardDescription className="text-base">
                Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="default" className="gap-2">
                  <Link href="/">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/backlogs">
                    <ArrowLeft className="w-4 h-4" />
                    My Backlogs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 