'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ArrowUpDown, ArrowUp, ArrowDown, FileText, Sparkles, Loader2, ChevronDown, ChevronRight, Target } from 'lucide-react'
import Link from 'next/link'
import type { UserStory, Backlog, Task } from '@/lib/database.types'
import type { UserStoryInput } from '@/lib/schemas/user-story'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import TaskGenerator from '@/components/task-generator'
import TaskManager from '@/components/task-manager'

interface EnhancedStoriesTableProps {
  savedStories: UserStory[]
  generatingStories: UserStoryInput[]
  isGenerating: boolean
  isGenerationComplete: boolean
  user: User | null
  backlog?: Backlog | null
}

type SortField = 'title' | 'created_at' | 'status'
type SortDirection = 'asc' | 'desc'

const statusStyles = {
  backlog: 'bg-muted text-muted-foreground border-muted',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  done: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  generating: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 animate-pulse',
}

const statusLabels = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  done: 'Done',
  generating: 'Generating...',
}

export default function EnhancedStoriesTable({ 
  savedStories, 
  generatingStories, 
  isGenerating, 
  isGenerationComplete,
  user,
  backlog 
}: EnhancedStoriesTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedStory, setExpandedStory] = useState<string | null>(null)
  const [storyTasks, setStoryTasks] = useState<Record<string, Task[]>>({})
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({})

  // Fetch tasks for a specific story
  const fetchTasksForStory = async (storyId: string) => {
    if (loadingTasks[storyId] || storyTasks[storyId] || !user) return

    setLoadingTasks(prev => ({ ...prev, [storyId]: true }))
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_story_id', storyId)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      if (error) throw error
      
      setStoryTasks(prev => ({ ...prev, [storyId]: data || [] }))
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setStoryTasks(prev => ({ ...prev, [storyId]: [] }))
    } finally {
      setLoadingTasks(prev => ({ ...prev, [storyId]: false }))
    }
  }

  // Calculate task progress for a story
  const getTaskProgress = (storyId: string) => {
    const tasks = storyTasks[storyId] || []
    if (tasks.length === 0) return null
    
    const completed = tasks.filter(t => t.status === 'done').length
    const total = tasks.length
    const percentage = Math.round((completed / total) * 100)
    
    return { completed, total, percentage }
  }

  // Combine saved and generating stories for display
  const allStories = useMemo(() => {
    const combined = [
      // Add generating stories at the top with temporary IDs
      ...generatingStories.map((story, index) => ({
        id: `generating-${index}`,
        title: story.title || 'Generating...',
        description: story.description || 'AI is creating this story...',
        acceptance_criteria: story.acceptanceCriteria || [],
        status: 'generating' as const,
        created_at: new Date().toISOString(),
        user_id: user?.id || '',
        backlog_id: backlog?.id || null,
        updated_at: new Date().toISOString(),
        isGenerating: true,
      })),
      // Add saved stories
      ...savedStories.map(story => ({
        ...story,
        acceptance_criteria: (story.acceptance_criteria as string[]) || [],
        isGenerating: false,
      }))
    ]
    return combined
  }, [savedStories, generatingStories, user?.id, backlog?.id])

  const sortedStories = useMemo(() => {
    return [...allStories].sort((a, b) => {
      // Always put generating stories first
      if (a.isGenerating && !b.isGenerating) return -1
      if (!a.isGenerating && b.isGenerating) return 1

      let aValue: string | number = a[sortField] || ''
      let bValue: string | number = b[sortField] || ''

      if (sortField === 'created_at') {
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [allStories, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />
  }

  const toggleExpanded = (storyId: string) => {
    const newExpandedStory = expandedStory === storyId ? null : storyId
    setExpandedStory(newExpandedStory)
    
    // Fetch tasks when expanding a real story (not generating)
    if (newExpandedStory && !newExpandedStory.startsWith('generating-')) {
      fetchTasksForStory(newExpandedStory)
    }
  }

  const refreshTasks = (storyId: string) => {
    // Clear cached tasks and refetch
    setStoryTasks(prev => {
      const newTasks = { ...prev }
      delete newTasks[storyId]
      return newTasks
    })
    fetchTasksForStory(storyId)
  }

  // Show empty state only when there are no stories at all
  if (allStories.length === 0 && !isGenerating) {
    return (
      <Card className="relative">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No User Stories Yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Generate your first user stories using the AI tool above. Once created, they&apos;ll appear in this backlog table.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative">
      {/* Apple Intelligence-like glow effect */}
      {isGenerationComplete && (
        <div className="absolute -inset-3 rounded-xl opacity-75 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-xl blur-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 via-pink-400/10 to-orange-400/10 rounded-xl blur-md"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 via-purple-300/5 via-pink-300/5 to-orange-300/5 rounded-xl blur-sm"></div>
        </div>
      )}
      
      <Card className={`relative transition-all duration-500 ${isGenerationComplete ? 'shadow-2xl shadow-blue-500/20' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {backlog ? `${backlog.name} - User Stories` : 'User Stories Backlog'}
                {isGenerating && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
                {isGenerationComplete && (
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                )}
              </CardTitle>
              <CardDescription>
                {allStories.length} {allStories.length === 1 ? 'story' : 'stories'} in your backlog
                {generatingStories.length > 0 && (
                  <span className="text-blue-600 dark:text-blue-400 ml-2">
                    • {generatingStories.length} generating
                  </span>
                )}
              </CardDescription>
            </div>
            
            {generatingStories.length > 0 && (
              <Badge 
                variant="outline" 
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 animate-pulse"
              >
                New Stories Incoming...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50%]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('title')}
                        className="h-auto p-0 font-medium hover:text-primary"
                      >
                        Title
                        {getSortIcon('title')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('status')}
                        className="h-auto p-0 font-medium hover:text-primary"
                      >
                        Status
                        {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead>Task Progress</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('created_at')}
                        className="h-auto p-0 font-medium hover:text-primary"
                      >
                        Created
                        {getSortIcon('created_at')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStories.map((story) => {
                    const taskProgress = getTaskProgress(story.id)
                    const isExpanded = expandedStory === story.id
                    const isGeneratingStory = story.isGenerating
                    
                    return (
                      <TableRow 
                        key={story.id}
                        className={`transition-all duration-300 cursor-pointer ${
                          isGeneratingStory 
                            ? 'bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse' 
                            : isExpanded 
                            ? 'bg-muted/30' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleExpanded(story.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm line-clamp-2">
                                {!isGeneratingStory && backlog ? (
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
                              </div>
                              {!isExpanded && (
                                <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                  {story.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={statusStyles[story.status as keyof typeof statusStyles] || statusStyles.backlog}
                          >
                            {statusLabels[story.status as keyof typeof statusLabels] || 'Backlog'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!isGeneratingStory && (
                            <>
                              {taskProgress ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Progress value={taskProgress.percentage} className="h-1.5 flex-1 max-w-[80px]" />
                                    <span className="text-xs text-muted-foreground">
                                      {taskProgress.completed}/{taskProgress.total}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {taskProgress.percentage}% complete
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">No tasks</span>
                              )}
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(story.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {!isGeneratingStory && (
                            <div className="flex items-center gap-1">
                              {taskProgress && taskProgress.total > 0 ? (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <Target className="w-3 h-3" />
                                  {taskProgress.total}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 text-xs border-dashed">
                                  <Target className="w-3 h-3" />
                                  0
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Expanded Content - Outside of table */}
            {expandedStory && !expandedStory.startsWith('generating-') && (
              <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                  {(() => {
                    const story = sortedStories.find(s => s.id === expandedStory)
                    if (!story) return null

                    return (
                      <div className="space-y-6">
                        {/* Story Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {story.description}
                            </p>
                          </div>
                          
                          {story.acceptance_criteria.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                              <ul className="space-y-1">
                                {story.acceptance_criteria.map((criteria, index) => (
                                  <li 
                                    key={index} 
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                  >
                                    <span className="text-primary font-medium">•</span>
                                    <span>{criteria}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <Separator />
                        
                        {/* Task Section */}
                        {user && !story.isGenerating && (
                          <div className="space-y-4">
                            {/* Task Generator */}
                            <TaskGenerator 
                              userStory={story as UserStory}
                              onTasksGenerated={() => refreshTasks(story.id)}
                            />
                            
                            {/* Task Manager */}
                            <TaskManager 
                              userStory={story as UserStory}
                              user={user}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 