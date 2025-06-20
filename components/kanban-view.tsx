'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, CheckCircle } from 'lucide-react'
import type { UserStory, Backlog } from '@/lib/database.types'
import type { User } from '@supabase/supabase-js'

interface KanbanViewProps {
  stories: UserStory[]
  backlog?: Backlog | null
  user: User | null
  onStoryUpdate: () => void
}

// Dynamic import for the client-only kanban component
const KanbanViewClient = dynamic(() => import('./kanban-view-client'), {
  ssr: false,
  loading: () => <KanbanViewLoading />
})

function KanbanViewLoading() {
  const statusConfig = [
    { title: 'Backlog', icon: Clock, bgColor: 'bg-muted/30' },
    { title: 'In Progress', icon: Play, bgColor: 'bg-blue-50 dark:bg-blue-950/20' },
    { title: 'Done', icon: CheckCircle, bgColor: 'bg-green-50 dark:bg-green-950/20' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Kanban Board</h3>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
      <div className="flex gap-6">
        {statusConfig.map((config, index) => {
          const IconComponent = config.icon
          return (
            <div key={index} className="flex-1 min-w-80">
              <Card className={`h-full ${config.bgColor}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <CardTitle className="text-sm font-semibold">
                      {config.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">0</Badge>
                  </div>
                </CardHeader>
                <CardContent className="min-h-96">
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm">Loading...</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function KanbanView(props: KanbanViewProps) {
  return <KanbanViewClient {...props} />
} 