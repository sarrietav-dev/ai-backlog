'use client'

import { Brain } from 'lucide-react'
import Link from 'next/link'
import AuthButton from '@/components/auth/auth-button'
import { ThemeToggle } from '@/components/theme-toggle'
import type { User } from '@supabase/supabase-js'

interface AppHeaderProps {
  user: User | null
}

export default function AppHeader({ user }: AppHeaderProps) {
  return (
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
  )
} 