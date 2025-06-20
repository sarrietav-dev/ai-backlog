'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Progress } from '@/components/ui/progress'
import { 
  MessageSquare, 
  FileText, 
  Kanban,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import type { Backlog } from '@/lib/database.types'

interface BacklogOverviewProps {
  backlogId: string
}

interface OverviewData {
  backlog: Backlog | null
  totalStories: number
  completedStories: number
  totalTasks: number
  completedTasks: number
  recentActivity: Array<{
    type: 'story' | 'task' | 'chat'
    title: string
    createdAt: string
  }>
}

export default function BacklogOverview({ backlogId }: BacklogOverviewProps) {
  const { user } = useUser()
  const [data, setData] = useState<OverviewData>({
    backlog: null,
    totalStories: 0,
    completedStories: 0,
    totalTasks: 0,
    completedTasks: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOverviewData() {
      if (!user) return

      const supabase = createClient()
      
      try {
        // Fetch backlog
        const { data: backlog } = await supabase
          .from('backlogs')
          .select('*')
          .eq('id', backlogId)
          .eq('user_id', user.id)
          .single()

        // Fetch user stories stats
        const { data: stories } = await supabase
          .from('user_stories')
          .select('id, status')
          .eq('backlog_id', backlogId)
          .eq('user_id', user.id)

        // Fetch tasks stats
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, status')
          .in('user_story_id', stories?.map(s => s.id) || [])
          .eq('user_id', user.id)

        const totalStories = stories?.length || 0
        const completedStories = stories?.filter(s => s.status === 'done').length || 0
        const totalTasks = tasks?.length || 0
        const completedTasks = tasks?.filter(t => t.status === 'done').length || 0

        setData({
          backlog: backlog || null,
          totalStories,
          completedStories,
          totalTasks,
          completedTasks,
          recentActivity: [] // TODO: Implement recent activity
        })
      } catch (error) {
        console.error('Error loading overview data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOverviewData()
  }, [backlogId, user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const storyProgress = data.totalStories > 0 ? Math.round((data.completedStories / data.totalStories) * 100) : 0
  const taskProgress = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0

  const quickActions = [
    {
      title: 'AI Chat',
      description: 'Brainstorm and refine ideas',
      href: `/backlogs/${backlogId}/chat`,
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'User Stories',
      description: 'Manage requirements',
      href: `/backlogs/${backlogId}/stories`,
      icon: FileText,
      color: 'text-green-600 bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Kanban Board',
      description: 'Visual workflow',
      href: `/backlogs/${backlogId}/kanban`,
      icon: Kanban,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Tech Stack',
      description: 'AI recommendations',
      href: `/backlogs/${backlogId}/techstack`,
      icon: Sparkles,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Stories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStories}</div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{data.completedStories}/{data.totalStories}</span>
              </div>
              <Progress value={storyProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Development Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTasks}</div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{data.completedTasks}/{data.totalTasks}</span>
              </div>
              <Progress value={taskProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((storyProgress + taskProgress) / 2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Health</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storyProgress > 75 ? '🟢' : storyProgress > 25 ? '🟡' : '🔴'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {storyProgress > 75 ? 'On track' : storyProgress > 25 ? 'At risk' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.href} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                <Link href={action.href}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity - Placeholder for now */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates to your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Activity tracking coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 