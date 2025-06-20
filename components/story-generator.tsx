'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, Save } from 'lucide-react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { userStoriesResponseSchema, type UserStoriesResponse, type UserStoryInput } from '@/lib/schemas/user-story'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

interface StoryGeneratorProps {
  user: User | null
  onGenerationStart?: () => void
  onStoriesUpdated?: (stories: UserStoryInput[]) => void
  onGenerationComplete?: () => void
  onStoriesSaved?: () => void
}

export default function StoryGenerator({ 
  user, 
  onGenerationStart,
  onStoriesUpdated,
  onGenerationComplete,
  onStoriesSaved 
}: StoryGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastGeneratedStories, setLastGeneratedStories] = useState<UserStoriesResponse | null>(null)

  const { object, submit, isLoading, error } = useObject({
    api: '/api/generate-stories',
    schema: userStoriesResponseSchema,
    onFinish: ({ object: result }: { object: UserStoriesResponse | undefined; error: Error | undefined }) => {
      if (result) {
        setLastGeneratedStories(result)
        toast.success(`Generated ${result.stories.length} user stories!`)
        onGenerationComplete?.()
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to generate stories. Please try again.')
      console.error('Generation error:', error)
    }
  })

  // Call onStoriesUpdated when object changes during streaming
  useEffect(() => {
    if (object?.stories && isLoading) {
      const validStories = object.stories.filter((story): story is UserStoryInput => 
        story !== undefined && story.title !== undefined
      )
      onStoriesUpdated?.(validStories)
    }
  }, [object?.stories, isLoading, onStoriesUpdated])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    
    onGenerationStart?.()
    submit({ prompt: prompt.trim() })
  }

  const handleSaveStories = async () => {
    if (!lastGeneratedStories || !user) {
      toast.error(user ? 'No stories to save' : 'Please sign in to save stories')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/save-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastGeneratedStories),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Saved ${result.count} user stories to your backlog!`)
        setLastGeneratedStories(null)
        setPrompt('')
        onStoriesSaved?.()
      } else {
        throw new Error(result.error || 'Failed to save stories')
      }
    } catch (error) {
      toast.error('Failed to save stories. Please try again.')
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }



  return (
    <div className="space-y-6">
      {/* Prompt Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate User Stories
          </CardTitle>
          <CardDescription>
            Describe your product idea and get AI-generated user stories for your backlog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., I want to build a web app for booking dog walking appointments"
              className="min-h-[100px]"
              disabled={isLoading}
            />
            <div className="flex justify-between">
              <Button 
                type="submit" 
                disabled={!prompt.trim() || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate Stories
              </Button>
              
              {lastGeneratedStories && user && (
                <Button
                  type="button"
                  onClick={handleSaveStories}
                  disabled={saving}
                  variant="secondary"
                  className="gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save to Backlog
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">
              Error: {error.message}
            </p>
          </CardContent>
        </Card>
      )}



      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Generating user stories...</p>
          </div>
        </div>
      )}
    </div>
  )
} 