'use client'


import { experimental_useObject as useObject } from 'ai/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Code, 
  Database, 
  Globe, 
  Smartphone, 
  Brain, 
  BarChart3, 
  Shield, 
  CreditCard, 
  Cloud,
  Monitor,
  Settings,
  Loader2,
  Sparkles,
  Clock,
  Target
} from 'lucide-react'
import type { TechStackResponse, Technology } from '@/lib/schemas/tech-stack'
import { techStackResponseSchema } from '@/lib/schemas/tech-stack'
import type { Backlog } from '@/lib/database.types'

interface TechStackSuggestionsProps {
  backlog: Backlog
}

const categoryIcons = {
  frontend: Code,
  backend: Database,
  database: Database,
  hosting: Globe,
  mobile: Smartphone,
  'ai-ml': Brain,
  analytics: BarChart3,
  authentication: Shield,
  payment: CreditCard,
  storage: Cloud,
  monitoring: Monitor,
  devops: Settings
}

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
}

const complexityColors = {
  simple: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  moderate: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  complex: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
}

export default function TechStackSuggestions({ backlog }: TechStackSuggestionsProps) {
  const { object: suggestions, submit, isLoading, error, stop } = useObject({
    api: '/api/generate-tech-stack',
    schema: techStackResponseSchema,
  })

  const handleGenerateTechStack = async () => {
    submit({
      backlogId: backlog.id
    })
  }

  const groupedSuggestions = suggestions?.suggestions?.filter((tech): tech is Technology => 
    Boolean(tech?.category && tech?.name && tech?.description)
  ).reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = []
    }
    acc[tech.category].push(tech)
    return acc
  }, {} as Record<string, Technology[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle>Tech Stack Suggestions</CardTitle>
              <CardDescription>
                AI-powered technology recommendations based on your user stories
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!suggestions && !isLoading && (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                Get personalized technology stack recommendations for "{backlog.name}" 
                based on your user stories and project requirements.
              </p>
              <Button 
                onClick={handleGenerateTechStack} 
                size="lg" 
                className="gap-2"
                disabled={isLoading}
              >
                <Sparkles className="w-4 h-4" />
                Generate Tech Stack Suggestions
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
              <p className="text-muted-foreground">
                Analyzing your project and generating tech stack recommendations...
              </p>
              <Button onClick={stop} variant="outline" size="sm">
                Stop Generation
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center py-8 space-y-4">
              <p className="text-red-600 dark:text-red-400">
                Failed to generate tech stack suggestions. Please try again.
              </p>
              <Button onClick={handleGenerateTechStack} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {suggestions && (
        <>
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Project Type</p>
                  <p className="font-medium">{suggestions?.projectType || 'Analyzing...'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Complexity</p>
                  <Badge className={suggestions?.complexity ? complexityColors[suggestions.complexity] : 'bg-gray-500/10 text-gray-600'}>
                    {suggestions?.complexity || 'Determining...'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Estimated Timeframe</p>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{suggestions?.estimatedTimeframe || 'Calculating...'}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Key Features Identified</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions?.keyFeatures?.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  )) || (
                    <Badge variant="outline">
                      Identifying features...
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Suggestions */}
          <div className="grid gap-6">
            {groupedSuggestions && Object.entries(groupedSuggestions).map(([category, technologies]) => {
              const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Code
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <IconComponent className="w-5 h-5" />
                      {category.replace('-', ' & ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {technologies.map((tech, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-lg">{tech.name}</h4>
                            <p className="text-muted-foreground">{tech.description}</p>
                          </div>
                          <Badge className={difficultyColors[tech.difficulty]}>
                            {tech.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground font-medium">Why this technology:</p>
                          <p className="text-sm">{tech.reasoning}</p>
                        </div>
                        
                        {tech.alternatives && tech.alternatives.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground font-medium">Alternatives:</p>
                            <div className="flex flex-wrap gap-2">
                              {tech.alternatives.map((alt, altIndex) => (
                                <Badge key={altIndex} variant="outline">
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Regenerate Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Want different suggestions or have updated your user stories?
                </p>
                <Button onClick={handleGenerateTechStack} variant="outline" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Regenerate Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 