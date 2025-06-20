'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import StoryGenerator from '@/components/story-generator'
import EnhancedStoriesTable from '@/components/enhanced-stories-table'
import type { User } from '@supabase/supabase-js'
import type { UserStory } from '@/lib/database.types'
import type { UserStoryInput } from '@/lib/schemas/user-story'

interface StoryManagerProps {
  user: User | null
}

export default function StoryManager({ user }: StoryManagerProps) {
  const [savedStories, setSavedStories] = useState<UserStory[]>([])
  const [generatingStories, setGeneratingStories] = useState<UserStoryInput[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerationComplete, setIsGenerationComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load saved stories
  useEffect(() => {
    if (user) {
      loadUserStories()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadUserStories = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data: stories, error } = await supabase
        .from('user_stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

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
  }

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
        onGenerationStart={handleGenerationStart}
        onStoriesUpdated={handleStoriesUpdated}
        onGenerationComplete={handleGenerationComplete}
        onStoriesSaved={handleStoriesSaved}
      />

      {/* Enhanced Stories Table */}
      <EnhancedStoriesTable 
        savedStories={savedStories}
        generatingStories={generatingStories}
        isGenerating={isGenerating}
        isGenerationComplete={isGenerationComplete}
        user={user}
      />
    </div>
  )
} 