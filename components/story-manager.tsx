'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import StoryGenerator from '@/components/story-generator'
import EnhancedStoriesTable from '@/components/enhanced-stories-table'
import KanbanView from '@/components/kanban-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, Kanban } from 'lucide-react'
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

  const handleGenerationStart = () => {
    setIsGenerating(true)
    setIsGenerationComplete(false)
    setGeneratingStories([])
  }

  const handleStoriesUpdated = (stories: UserStoryInput[]) => {
    setGeneratingStories(stories)
  }

  const handleGenerationComplete = () => {
    setIsGenerating(false)
    setIsGenerationComplete(true)
    
    // Reset the glow effect after a delay
    setTimeout(() => {
      setIsGenerationComplete(false)
    }, 3000)
  }

  const handleStoriesSaved = () => {
    // Clear generating stories and reload saved stories
    setGeneratingStories([])
    setIsGenerationComplete(false)
    loadUserStories()
  }

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