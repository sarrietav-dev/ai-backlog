'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Calendar,
  Brain,
  MessageSquare, 
  FileText, 
  Kanban,
  CheckSquare,
  Sparkles,
  BarChart3
} from 'lucide-react'
import type { Backlog } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface BacklogNavigationProps {
  backlog: Backlog
}

export default function BacklogNavigation({ backlog }: BacklogNavigationProps) {
  const pathname = usePathname()
  const backlogId = backlog.id

  const navItems = [
    {
      href: `/backlogs/${backlogId}`,
      label: 'Overview',
      icon: BarChart3,
      description: 'Project dashboard and metrics'
    },
    {
      href: `/backlogs/${backlogId}/chat`,
      label: 'AI Chat',
      icon: MessageSquare,
      description: 'Brainstorm with AI assistant'
    },
    {
      href: `/backlogs/${backlogId}/stories`,
      label: 'User Stories',
      icon: FileText,
      description: 'Manage product requirements'
    },
    {
      href: `/backlogs/${backlogId}/kanban`,
      label: 'Kanban Board',
      icon: Kanban,
      description: 'Visual workflow management'
    },
    {
      href: `/backlogs/${backlogId}/tasks`,
      label: 'All Tasks',
      icon: CheckSquare,
      description: 'Development task tracking'
    },
    {
      href: `/backlogs/${backlogId}/techstack`,
      label: 'Tech Stack',
      icon: Sparkles,
      description: 'AI-powered recommendations'
    }
  ]

  const isActive = (href: string) => {
    if (href === `/backlogs/${backlogId}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/backlogs">
              <ArrowLeft className="w-4 h-4" />
              Back to Backlogs
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{backlog.name}</h1>
              {backlog.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {backlog.description}
                </p>
              )}
            </div>
          </div>
          
          <Badge variant="secondary" className="gap-1">
            <Calendar className="w-3 h-3" />
            Created {new Date(backlog.created_at).toLocaleDateString()}
          </Badge>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 py-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted whitespace-nowrap group",
                  active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  active && "scale-110"
                )} />
                <span>{item.label}</span>
                {active && (
                  <div className="absolute inset-0 bg-primary/20 rounded-lg -z-10 blur-sm" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
} 