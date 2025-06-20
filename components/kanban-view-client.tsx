'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  type DropResult 
} from '@hello-pangea/dnd'
import { 
  Clock, 
  Play, 
  CheckCircle, 
  MoreVertical, 
  Calendar,
  Loader2 
} from 'lucide-react'
import type { UserStory, Backlog } from '@/lib/database.types'
import type { User } from '@supabase/supabase-js'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface KanbanViewClientProps {
  stories: UserStory[]
  backlog?: Backlog | null
  user: User | null
  onStoryUpdate: () => void
}

type Status = 'backlog' | 'in_progress' | 'done'

const statusConfig = {
  backlog: {
    title: 'Backlog',
    icon: Clock,
    color: 'bg-muted text-muted-foreground border-muted',
    bgColor: 'bg-muted/30',
  },
  in_progress: {
    title: 'In Progress',
    icon: Play,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  done: {
    title: 'Done',
    icon: CheckCircle,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  }
}

export default function KanbanViewClient({ stories, backlog, user, onStoryUpdate }: KanbanViewClientProps) {
  const [updatingStory, setUpdatingStory] = useState<string | null>(null)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Status>>({})

  // Clean up optimistic updates when stories change (parent component refresh)
  useEffect(() => {
    setOptimisticUpdates(prev => {
      const storyIds = new Set(stories.map(story => story.id))
      const filtered: Record<string, Status> = {}
      
      Object.entries(prev).forEach(([storyId, status]) => {
        if (storyIds.has(storyId)) {
          filtered[storyId] = status
        }
      })
      
      return filtered
    })
  }, [stories])

  // Group stories by status, applying optimistic updates
  const groupedStories = useMemo(() => {
    const groups = {
      backlog: [] as UserStory[],
      in_progress: [] as UserStory[],
      done: [] as UserStory[]
    }

    stories.forEach(story => {
      // Use optimistic status if available, otherwise use actual status
      const status = (optimisticUpdates[story.id] || story.status) as Status
      if (groups[status]) {
        groups[status].push({
          ...story,
          status: status as 'backlog' | 'in_progress' | 'done'
        })
      }
    })

    return groups
  }, [stories, optimisticUpdates])

  const updateStoryStatus = async (storyId: string, newStatus: Status, isOptimistic = false) => {
    if (!user) {
      toast.error('Please sign in to update stories')
      return
    }

    // For optimistic updates, apply immediately without API call
    if (isOptimistic) {
      setOptimisticUpdates(prev => ({
        ...prev,
        [storyId]: newStatus
      }))
      return
    }

    setUpdatingStory(storyId)
    try {
      const response = await fetch('/api/update-story-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          status: newStatus
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Clear optimistic update and refresh data
        setOptimisticUpdates(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [storyId]: _, ...rest } = prev
          return rest
        })
        toast.success('Story status updated!')
        onStoryUpdate()
      } else {
        throw new Error(result.error || 'Failed to update story')
      }
    } catch (error) {
      // Rollback optimistic update on error
      setOptimisticUpdates(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [storyId]: _, ...rest } = prev
        return rest
      })
      toast.error('Failed to update story status. Changes have been reverted.', {
        description: 'Please try again or check your connection.'
      })
      console.error('Update error:', error)
    } finally {
      setUpdatingStory(null)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // If dropped outside any droppable area
    if (!destination) return

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Extract the actual story ID from the draggable ID (remove "story-" prefix)
    const storyId = draggableId.replace('story-', '')
    const newStatus = destination.droppableId as Status

    // Apply optimistic update immediately for instant UI feedback
    updateStoryStatus(storyId, newStatus, true)

    // Then perform the actual API call
    updateStoryStatus(storyId, newStatus, false)
  }

  const StoryCard = ({ story, index }: { story: UserStory; index: number }) => {
    // Create a unique draggable ID to avoid conflicts
    const draggableId = `story-${story.id}`
    const isOptimistic = optimisticUpdates[story.id] !== undefined
    const isUpdating = updatingStory === story.id
    
    return (
      <Draggable draggableId={draggableId} index={index} isDragDisabled={!user}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 transition-all duration-200 hover:shadow-md ${
              snapshot.isDragging ? 'rotate-1 shadow-lg' : ''
            } ${
              isUpdating ? 'opacity-50' : ''
            } ${
              isOptimistic ? 'ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20' : ''
            } ${
              !user ? 'cursor-not-allowed opacity-60' : 'cursor-grab active:cursor-grabbing'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium leading-snug">
                  {backlog ? (
                    <Link
                      href={`/backlogs/${backlog.id}/stories/${story.id}`}
                      className="hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {story.title}
                    </Link>
                  ) : (
                    story.title
                  )}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        updateStoryStatus(story.id, 'backlog', true)
                        updateStoryStatus(story.id, 'backlog', false)
                      }}
                      disabled={story.status === 'backlog' || !user || isUpdating}
                    >
                      Move to Backlog
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateStoryStatus(story.id, 'in_progress', true)
                        updateStoryStatus(story.id, 'in_progress', false)
                      }}
                      disabled={story.status === 'in_progress' || !user || isUpdating}
                    >
                      Move to In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateStoryStatus(story.id, 'done', true)
                        updateStoryStatus(story.id, 'done', false)
                      }}
                      disabled={story.status === 'done' || !user || isUpdating}
                    >
                      Move to Done
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs line-clamp-3 mb-3">
                {story.description}
              </CardDescription>
              
              {story.acceptance_criteria && Array.isArray(story.acceptance_criteria) && story.acceptance_criteria.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Acceptance Criteria:
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(story.acceptance_criteria as string[]).length} criteria defined
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(story.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  {isOptimistic && !isUpdating && (
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs">Saving...</span>
                    </div>
                  )}
                  {isUpdating && (
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>
    )
  }

  const StatusColumn = ({ status, stories: columnStories }: { status: Status; stories: UserStory[] }) => {
    const config = statusConfig[status]
    const IconComponent = config.icon

    return (
      <div className="flex-1 min-w-80">
        <Card className={`h-full ${config.bgColor}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <CardTitle className="text-sm font-semibold">
                  {config.title}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {columnStories.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <Droppable droppableId={status}>
            {(provided, snapshot) => (
              <CardContent
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-96 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-primary/5' : ''
                }`}
              >
                {columnStories.map((story, index) => (
                  <StoryCard key={`${story.id}-${story.status}`} story={story} index={index} />
                ))}
                {provided.placeholder}
                
                {columnStories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm">No stories in {config.title.toLowerCase()}</div>
                    {user && (
                      <div className="text-xs mt-1">
                        Drag stories here to update status
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Droppable>
        </Card>
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="flex justify-center gap-4 mb-6">
              {Object.entries(statusConfig).map(([status, config]) => {
                const IconComponent = config.icon
                return (
                  <div key={status} className="text-center">
                    <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center mx-auto mb-2`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="text-xs text-muted-foreground">{config.title}</div>
                  </div>
                )
              })}
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No User Stories Yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Generate your first user stories using the AI tool. Once created, you can drag them between columns to track progress.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {backlog ? `${backlog.name} - Kanban Board` : 'Kanban Board'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} • 
            Drag and drop to update status
          </p>
        </div>
        
        {!user && (
          <Badge variant="outline" className="text-xs">
            Sign in to update story status
          </Badge>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          <StatusColumn status="backlog" stories={groupedStories.backlog} />
          <StatusColumn status="in_progress" stories={groupedStories.in_progress} />
          <StatusColumn status="done" stories={groupedStories.done} />
        </div>
      </DragDropContext>
    </div>
  )
} 