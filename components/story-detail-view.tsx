'use client'


import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, User as UserIcon, Edit, FileText, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import TaskManager from '@/components/task-manager'
import type { UserStory, Backlog } from '@/lib/database.types'
import type { User } from '@supabase/supabase-js'

interface StoryDetailViewProps {
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

export default function StoryDetailView({ story, backlog, user }: StoryDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/backlogs/${backlog.id}`} className="hover:text-foreground">
          {backlog.name}
        </Link>
        <span>/</span>
        <Link href={`/backlogs/${backlog.id}/stories`} className="hover:text-foreground">
          User Stories
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {story.title}
        </span>
      </div>

      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href={`/backlogs/${backlog.id}/stories`}>
            <ArrowLeft className="w-4 h-4" />
            Back to Stories
          </Link>
        </Button>
      </div>

      {/* Story Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={statusStyles[story.status || 'todo']}>
                {(story.status || 'todo').replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h1 className="text-3xl font-bold leading-tight">{story.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created {new Date(story.created_at).toLocaleDateString()}
                  </div>
                                   <div className="flex items-center gap-1">
                   <UserIcon className="w-4 h-4" />
                   Story #{story.id.slice(-8)}
                 </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Story
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Story Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {story.description || 'No description provided.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptance Criteria */}
          {story.acceptance_criteria && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Acceptance Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Development Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Development Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskManager userStory={story} user={user} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Story Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Story Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Status</div>
                <Badge variant="outline" className={statusStyles[story.status || 'todo']}>
                  {(story.status || 'todo').replace('_', ' ')}
                </Badge>
              </div>





              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(story.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Last Updated</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(story.updated_at).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Story ID</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {story.id.slice(-12)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="w-4 h-4 mr-2" />
                Edit Story
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/backlogs/${backlog.id}/kanban`}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  View on Kanban
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 