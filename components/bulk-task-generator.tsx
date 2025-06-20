'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Rocket, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Timer,
  Target,
  Sparkles,
  ListChecks,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import type { UserStory, Backlog } from '@/lib/database.types'

interface BulkTaskGeneratorProps {
  backlog: Backlog
  userStories: UserStory[]
  className?: string
  onTasksGenerated?: () => void
}

interface StoryProgress {
  storyId: string
  storyTitle: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  tasksCount?: number
  error?: string
}

export default function BulkTaskGenerator({ 
  backlog, 
  userStories, 
  className,
  onTasksGenerated 
}: BulkTaskGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [storyProgress, setStoryProgress] = useState<StoryProgress[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  const generateTasksForAllStories = async () => {
    if (isGenerating || userStories.length === 0) return

    setIsGenerating(true)
    setOverallProgress(0)
    setCurrentStep('Preparing to generate tasks for all stories...')

    // Initialize progress tracking
    const initialProgress: StoryProgress[] = userStories.map(story => ({
      storyId: story.id,
      storyTitle: story.title,
      status: 'pending'
    }))
    setStoryProgress(initialProgress)

    try {
      const totalStories = userStories.length

      for (let i = 0; i < userStories.length; i++) {
        const story = userStories[i]
        
        setCurrentStep(`Generating tasks for "${story.title}" (${i + 1}/${totalStories})...`)
        
        // Update progress for current story
        setStoryProgress(prev => prev.map(sp => 
          sp.storyId === story.id 
            ? { ...sp, status: 'generating' }
            : sp
        ))

        try {
          // Generate tasks for this story
          const generateResponse = await fetch('/api/generate-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userStoryId: story.id,
              context: `Bulk generation for ${backlog.name} backlog`
            })
          })

          if (!generateResponse.ok) {
            throw new Error('Failed to generate tasks')
          }

          // Parse the streaming response
          const reader = generateResponse.body?.getReader()
          if (!reader) throw new Error('No response body')

          let buffer = ''
          let generatedTasks: Array<{ title: string; description: string; priority: string; estimated_hours: number }> = []

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += new TextDecoder().decode(value)
              
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const data = JSON.parse(line)
                    if (data.tasks && Array.isArray(data.tasks)) {
                      generatedTasks = data.tasks
                    }
                  } catch {
                    // Ignore incomplete JSON
                  }
                }
              }
            }

            // Process any remaining buffer content
            if (buffer.trim()) {
              try {
                const data = JSON.parse(buffer.trim())
                if (data.tasks && Array.isArray(data.tasks)) {
                  generatedTasks = data.tasks
                }
              } catch {
                // Ignore incomplete JSON
              }
            }
          } finally {
            reader.releaseLock()
          }

          if (generatedTasks.length > 0) {
            // Save the generated tasks
            const saveResponse = await fetch('/api/save-tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userStoryId: story.id,
                tasks: generatedTasks
              })
            })

            if (!saveResponse.ok) {
              const errorText = await saveResponse.text()
              throw new Error(`Failed to save tasks: ${errorText}`)
            }

            // Mark story as completed
            setStoryProgress(prev => prev.map(sp => 
              sp.storyId === story.id 
                ? { ...sp, status: 'completed', tasksCount: generatedTasks.length }
                : sp
            ))
          } else {
            throw new Error(`No tasks were generated for story: ${story.title}`)
          }

        } catch (error) {
          console.error(`Error generating tasks for story ${story.id}:`, error)
          
          setStoryProgress(prev => prev.map(sp => 
            sp.storyId === story.id 
              ? { ...sp, status: 'error', error: 'Failed to generate tasks' }
              : sp
          ))
        }

        // Update overall progress
        const progress = Math.round(((i + 1) / totalStories) * 100)
        setOverallProgress(progress)

        // Small delay between stories to avoid overwhelming the API
        if (i < userStories.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      setCurrentStep('Bulk task generation completed!')
      
      const successCount = storyProgress.filter(sp => sp.status === 'completed').length
      const totalTasks = storyProgress.reduce((sum, sp) => sum + (sp.tasksCount || 0), 0)
      
      if (successCount > 0) {
        toast.success(`Generated ${totalTasks} tasks across ${successCount} user stories!`)
        if (onTasksGenerated) {
          onTasksGenerated()
        }
      } else {
        toast.error('No tasks were successfully generated')
      }

    } catch (error) {
      console.error('Error in bulk task generation:', error)
      toast.error('Failed to generate tasks for all stories')
      setCurrentStep('Bulk generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const statusIcons = {
    pending: Timer,
    generating: Loader2,
    completed: CheckCircle,
    error: AlertCircle
  }

  const statusColors = {
    pending: 'text-slate-500',
    generating: 'text-blue-500 animate-spin',
    completed: 'text-green-500',
    error: 'text-red-500'
  }

  if (userStories.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ListChecks className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No user stories in this backlog yet. Add some stories first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card className="relative overflow-hidden">
        {/* Animated background */}
        {isGenerating && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-green-500/5 animate-pulse" />
        )}
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
              <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            Bulk AI Task Generator
            {isGenerating && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            )}
          </CardTitle>
          <CardDescription>
            Generate AI tasks for all {userStories.length} user stories in &quot;{backlog.name}&quot;
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overall Progress */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {currentStep}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          )}

          {/* Story Progress List */}
          {storyProgress.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Progress by Story
              </h4>
              
              <ScrollArea className="h-64">
                <div className="space-y-2 pr-3">
                  {storyProgress.map((progress) => {
                    const StatusIcon = statusIcons[progress.status]
                    return (
                      <div 
                        key={progress.storyId}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                      >
                        <StatusIcon className={`w-4 h-4 ${statusColors[progress.status]}`} />
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {progress.storyTitle}
                          </p>
                          {progress.status === 'completed' && progress.tasksCount && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {progress.tasksCount} tasks generated
                            </p>
                          )}
                          {progress.status === 'error' && progress.error && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {progress.error}
                            </p>
                          )}
                        </div>

                        <Badge 
                          variant="outline" 
                          className={
                            progress.status === 'completed' 
                              ? 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400'
                              : progress.status === 'error'
                              ? 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                              : progress.status === 'generating'
                              ? 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400'
                          }
                        >
                          {progress.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={generateTasksForAllStories}
            disabled={isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Tasks for All Stories...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Tasks for All {userStories.length} Stories
              </>
            )}
          </Button>

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Bulk Task Generation
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                This will generate AI tasks for all user stories in your backlog. 
                The process will go through each story one by one and create specific, 
                actionable development tasks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 