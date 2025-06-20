'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import StoryGenerator from '@/components/story-generator'
import EnhancedStoriesTable from '@/components/enhanced-stories-table'
import KanbanView from '@/components/kanban-view'
import BulkTaskGenerator from '@/components/bulk-task-generator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, Kanban, Sparkles } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { UserStory, Backlog } from '@/lib/database.types'
import type { UserStoryInput } from '@/lib/schemas/user-story'

interface StoryManagerProps {
  user: User | null
  backlog?: Backlog | null
}

export default function StoryManager({ user, backlog }: StoryManagerProps) {
  const [savedStories, setSavedStories] = useState<UserStory[]>([])
  const [generatingStories, setGeneratingStories] = useState<UserStoryInput[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerationComplete, setIsGenerationComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadUserStories = useCallback(async () => {
    if (!user) return

    try {
      const supabase = createClient()
      let query = supabase
        .from('user_stories')
        .select('*')
        .eq('user_id', user.id)

      // If backlog is specified, filter by backlog_id
      if (backlog) {
        query = query.eq('backlog_id', backlog.id)
      } else {
        // If no backlog specified, show stories without backlog (for backwards compatibility)
        query = query.is('backlog_id', null)
      }

      const { data: stories, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching stories:', error)
      } else {
        setSavedStories(stories || [])
      }
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }, [user, backlog])

  // Load saved stories
  useEffect(() => {
    if (user) {
      loadUserStories()
    } else {
      setLoading(false)
    }
  }, [user, backlog?.id, loadUserStories])

  const handleGenerationStart = useCallback(() => {
    setIsGenerating(true)
    setIsGenerationComplete(false)
    setGeneratingStories([])
  }, [])

  const handleStoriesUpdated = useCallback((stories: UserStoryInput[]) => {
    setGeneratingStories(stories)
  }, [])

  const handleGenerationComplete = useCallback(() => {
    setIsGenerating(false)
    setIsGenerationComplete(true)
    
    // Reset the glow effect after a delay
    setTimeout(() => {
      setIsGenerationComplete(false)
    }, 3000)
  }, [])

  const handleStoriesSaved = useCallback(() => {
    // Clear generating stories and reload saved stories
    setGeneratingStories([])
    setIsGenerationComplete(false)
    loadUserStories()
  }, [loadUserStories])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Story Generator */}
      <StoryGenerator 
        user={user} 
        backlog={backlog}
        onGenerationStart={handleGenerationStart}
        onStoriesUpdated={handleStoriesUpdated}
        onGenerationComplete={handleGenerationComplete}
        onStoriesSaved={handleStoriesSaved}
      />

      {/* Bulk Task Generator - Show only if there are saved stories */}
      {savedStories.length > 0 && user && backlog && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Bulk AI Task Generation
              </CardTitle>
              <CardDescription>
                Generate AI tasks for all {savedStories.length} user stories in &quot;{backlog.name}&quot; at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkTaskGenerator
                backlog={backlog}
                userStories={savedStories}
                onTasksGenerated={loadUserStories}
              />
            </CardContent>
          </Card>
          <Separator />
        </>
      )}

      {/* Stories Views - Table and Kanban */}
      <Tabs defaultValue="table" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="table" className="gap-2">
            <Table className="w-4 h-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2">
            <Kanban className="w-4 h-4" />
            Kanban Board
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <EnhancedStoriesTable 
            savedStories={savedStories}
            generatingStories={generatingStories}
            isGenerating={isGenerating}
            isGenerationComplete={isGenerationComplete}
            user={user}
            backlog={backlog}
          />
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanView 
            stories={savedStories}
            backlog={backlog}
            user={user}
            onStoryUpdate={loadUserStories}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 