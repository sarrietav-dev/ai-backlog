'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Calendar,
  Brain,
  Kanban,
  RefreshCw
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Backlog, UserStory } from '@/lib/database.types'
import Link from 'next/link'
import KanbanViewClient from '@/components/kanban-view-client'
import { useRouter } from 'next/navigation'

interface KanbanPageProps {
  backlog: Backlog
  stories: UserStory[]
  user: User
}

export default function KanbanPage({ backlog, stories: initialStories, user }: KanbanPageProps) {
  const [stories, setStories] = useState(initialStories)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const handleStoryUpdate = async () => {
    setRefreshing(true)
    try {
      // Refresh the page data
      router.refresh()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href={`/backlogs/${backlog.id}`}>
              <ArrowLeft className="w-4 h-4" />
              Back to Backlog
            </Link>
          </Button>
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Kanban className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {backlog.name} - Kanban Board
                    </CardTitle>
                    {backlog.description && (
                      <CardDescription className="text-base mt-1">
                        {backlog.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStoryUpdate}
                  disabled={refreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="secondary" className="gap-1">
                <Calendar className="w-3 h-3" />
                Created {new Date(backlog.created_at).toLocaleDateString()}
              </Badge>
              <Badge variant="outline">
                {stories.length} {stories.length === 1 ? 'Story' : 'Stories'}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Kanban Board */}
      <KanbanViewClient 
        stories={stories}
        backlog={backlog}
        user={user}
        onStoryUpdate={handleStoryUpdate}
      />
    </div>
  )
} 