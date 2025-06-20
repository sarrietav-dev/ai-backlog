'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Brain, 
  Zap,
  Clock,
  Target,
  ListTodo
} from 'lucide-react'
import { toast } from 'sonner'
import type { UserStory } from '@/lib/database.types'
import type { TaskInput } from '@/lib/schemas/task'

interface TaskGeneratorProps {
  userStory: UserStory
  onTasksGenerated?: (tasks: TaskInput[]) => void
  className?: string
}

const priorityColors = {
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

export default function TaskGenerator({ userStory, onTasksGenerated, className }: TaskGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState<TaskInput[]>([])
  const [context, setContext] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  const generateTasks = async () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    setGenerationComplete(false)
    setGeneratedTasks([])
    setProgress(0)
    setCurrentStep('Analyzing user story...')

    try {
      // Simulate progress steps
      const progressSteps = [
        { step: 'Analyzing user story requirements...', progress: 20 },
        { step: 'Breaking down acceptance criteria...', progress: 40 },
        { step: 'Generating development tasks...', progress: 60 },
        { step: 'Optimizing task priorities...', progress: 80 },
        { step: 'Finalizing task breakdown...', progress: 95 }
      ]

      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userStoryId: userStory.id,
          context: context.trim() || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate tasks')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let buffer = ''
      let stepIndex = 0

      // Progress simulation
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length) {
          const current = progressSteps[stepIndex]
          setCurrentStep(current.step)
          setProgress(current.progress)
          stepIndex++
        }
      }, 800)

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += new TextDecoder().decode(value)
          
          // Try to parse complete JSON objects
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line)
                if (data.tasks) {
                  setGeneratedTasks(data.tasks)
                  setProgress(100)
                  setCurrentStep('Tasks generated successfully!')
                  setGenerationComplete(true)
                  clearInterval(progressInterval)
                  
                  if (onTasksGenerated) {
                    onTasksGenerated(data.tasks)
                  }
                  
                  toast.success(`Generated ${data.tasks.length} tasks for &quot;${userStory.title}&quot;`)
                  break
                }
              } catch {
                // Ignore incomplete JSON
              }
            }
          }
        }
      } finally {
        clearInterval(progressInterval)
      }

    } catch (error) {
      console.error('Error generating tasks:', error)
      toast.error('Failed to generate tasks. Please try again.')
      setProgress(0)
      setCurrentStep('')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveTasks = async () => {
    if (isSaving || generatedTasks.length === 0) return
    
    setIsSaving(true)

    try {
      const response = await fetch('/api/save-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userStoryId: userStory.id,
          tasks: generatedTasks
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save tasks')
      }

      const result = await response.json()
      toast.success(`Saved ${result.count} tasks successfully!`)
      
      // Reset the state
      setGeneratedTasks([])
      setGenerationComplete(false)
      setContext('')
      setProgress(0)
      setCurrentStep('')

    } catch (error) {
      console.error('Error saving tasks:', error)
      toast.error('Failed to save tasks. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={className}>
      <Card className="relative overflow-hidden">
        {/* Animated background gradient */}
        {isGenerating && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
        )}
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                AI Task Generator
                {isGenerating && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
              </CardTitle>
              <CardDescription>
                Break down &quot;{userStory.title}&quot; into actionable development tasks
              </CardDescription>
            </div>
            
            {generationComplete && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 animate-pulse">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready to Save
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Context Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional Context <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              placeholder="Add any specific requirements, tech stack preferences, or constraints..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={isGenerating}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {currentStep}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Generated Tasks Preview */}
          {generatedTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-green-600" />
                <h4 className="font-medium">Generated Tasks ({generatedTasks.length})</h4>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedTasks.map((task, index) => (
                  <Card key={index} className="border-2 border-dashed border-green-500/20 bg-green-500/5">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-medium text-sm line-clamp-2">{task.title}</h5>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              className={priorityColors[task.priority || 'medium']}
                            >
                              {priorityIcons[task.priority || 'medium']} {task.priority || 'medium'}
                            </Badge>
                            {task.estimatedHours && (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimatedHours}h
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={generateTasks}
              disabled={isGenerating || isSaving}
              className="flex-1 gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Tasks...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Tasks
                </>
              )}
            </Button>

            {generatedTasks.length > 0 && (
              <Button 
                onClick={saveTasks}
                disabled={isGenerating || isSaving}
                variant="outline"
                className="gap-2 border-green-500/20 text-green-600 hover:bg-green-500/10"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Save {generatedTasks.length} Tasks
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI-Powered Task Breakdown
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Our AI analyzes your user story and creates specific, actionable development tasks 
                covering the complete implementation lifecycle.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 