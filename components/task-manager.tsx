'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreHorizontal, 
  PlayCircle, 
  Target,
  TrendingUp,
  ListTodo,
  Calendar,
  Timer,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import type { Task, UserStory } from '@/lib/database.types'
import type { User } from '@supabase/supabase-js'

interface TaskManagerProps {
  userStory: UserStory
  user: User
  className?: string
}

const statusStyles = {
  todo: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  done: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
}

const priorityStyles = {
  low: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
}

const priorityIcons = {
  low: '🟢',
  medium: '🔵',
  high: '🟠',
  critical: '🔴'
}

const statusIcons = {
  todo: Circle,
  in_progress: PlayCircle,
  done: CheckCircle2
}

export default function TaskManager({ userStory, user, className }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_story_id', userStory.id)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [userStory.id, user.id])

  // Progress calculations
  const taskStats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'done').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const todo = tasks.filter(t => t.status === 'todo').length
    const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
    const completedHours = tasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
    
    return {
      total,
      completed,
      inProgress, 
      todo,
      totalHours,
      completedHours,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      hoursProgressPercentage: totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0
    }
  }, [tasks])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setUpdatingTask(taskId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .eq('user_id', user.id)

      if (error) throw error

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )
      
      toast.success('Task status updated!')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task status')
    } finally {
      setUpdatingTask(null)
    }
  }

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    updateTaskStatus(task.id, newStatus)
  }

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ListTodo className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Tasks Yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Use the AI Task Generator above to break down this user story into actionable development tasks.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Development Tasks
                <Badge variant="outline" className="ml-2">
                  {tasks.length} tasks
                </Badge>
              </CardTitle>
              <CardDescription>
                Track progress for &quot;{userStory.title}&quot;
              </CardDescription>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Task Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  {taskStats.completed}/{taskStats.total} completed
                </span>
              </div>
              <Progress value={taskStats.progressPercentage} className="h-2" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {taskStats.completed} Done
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {taskStats.inProgress} In Progress
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  {taskStats.todo} Todo
                </span>
              </div>
            </div>

            {taskStats.totalHours > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    Time Progress
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {taskStats.completedHours}h / {taskStats.totalHours}h
                  </span>
                </div>
                <Progress value={taskStats.hoursProgressPercentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {taskStats.hoursProgressPercentage}% of estimated time completed
                </div>
              </div>
            )}
          </div>

          {/* Achievement Badge */}
          {taskStats.progressPercentage === 100 && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  🎉 User Story Complete!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  All tasks for this story have been completed
                </p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => {
              const StatusIcon = statusIcons[task.status]
              const isUpdating = updatingTask === task.id
              
              return (
                <Card 
                  key={task.id} 
                  className={`transition-all duration-200 hover:shadow-sm ${
                    task.status === 'done' ? 'opacity-75 bg-green-500/5' : ''
                  } ${isUpdating ? 'scale-[0.99] opacity-75' : ''}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.status === 'done'}
                        onCheckedChange={() => toggleTaskStatus(task)}
                        disabled={isUpdating}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium text-sm ${
                            task.status === 'done' ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              className={priorityStyles[task.priority]}
                            >
                              {priorityIcons[task.priority]} {task.priority}
                            </Badge>
                            
                            {task.estimated_hours && (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimated_hours}h
                              </Badge>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={() => updateTaskStatus(task.id, 'todo')}
                                  disabled={task.status === 'todo' || isUpdating}
                                >
                                  <Circle className="w-4 h-4 mr-2" />
                                  Mark as Todo
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                  disabled={task.status === 'in_progress' || isUpdating}
                                >
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateTaskStatus(task.id, 'done')}
                                  disabled={task.status === 'done' || isUpdating}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark as Done
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <p className={`text-sm text-muted-foreground ${
                          task.status === 'done' ? 'line-through' : ''
                        }`}>
                          {task.description}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={statusStyles[task.status]}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {task.status.replace('_', ' ')}
                          </Badge>
                          
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 