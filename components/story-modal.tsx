'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ExternalLink, Calendar, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import TaskManager from '@/components/task-manager'
import type { UserStory, Backlog } from '@/lib/database.types'
import type { User } from '@supabase/supabase-js'

interface StoryModalProps {
  story: UserStory
  backlog: Backlog
  user: User
}

const statusStyles = {
  todo: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  done: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  backlog: 'bg-muted text-muted-foreground border-muted',
}

export default function StoryModal({ story, backlog, user }: StoryModalProps) {
  const router = useRouter()

  return (
    <Dialog 
      defaultOpen={true}
      onOpenChange={(open) => {
        if (!open) {
          router.back()
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={statusStyles[story.status || 'todo']}>
                  {(story.status || 'todo').replace('_', ' ')}
                </Badge>
              </div>
              
              <h2 className="text-2xl font-bold leading-tight">{story.title}</h2>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(story.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  Story #{story.id.slice(-8)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/backlogs/${backlog.id}/stories/${story.id}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Full View
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Story Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Description</h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {story.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Acceptance Criteria */}
          {story.acceptance_criteria && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Acceptance Criteria</h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {typeof story.acceptance_criteria === 'string' ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {story.acceptance_criteria}
                  </p>
                ) : Array.isArray(story.acceptance_criteria) ? (
                  <ul className="text-muted-foreground list-disc list-inside space-y-1">
                    {story.acceptance_criteria.map((criteria, index) => (
                      <li key={index}>{typeof criteria === 'string' ? criteria : JSON.stringify(criteria)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(story.acceptance_criteria, null, 2)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tasks */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Development Tasks</h3>
            <TaskManager userStory={story} user={user} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 