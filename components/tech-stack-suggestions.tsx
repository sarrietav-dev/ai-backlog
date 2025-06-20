'use client'

import { useState, useEffect } from 'react'
import { experimental_useObject as useObject } from 'ai/react'
import { techStackResponseSchema } from '@/lib/schemas/tech-stack'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Brain, 
  Clock,
  Database, 
  Server, 
  Smartphone, 
  Globe, 
  Shield, 
  CreditCard, 
  HardDrive, 
  BarChart, 
  Settings,
  Sparkles,
  Zap,
  Download,
  Copy,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Loader2,
  Archive,
  Calendar,
  AlertCircle,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'

interface TechStackSuggestionsProps {
  backlogId: string
}

const categoryIcons = {
  frontend: Globe,
  backend: Server,
  database: Database,
  hosting: Globe,
  mobile: Smartphone,
  'ai-ml': Brain,
  analytics: BarChart,
  authentication: Shield,
  payment: CreditCard,
  storage: HardDrive,
  monitoring: BarChart,
  devops: Settings,
}

const complexityColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const projectComplexityColors = {
  simple: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  complex: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function TechStackSuggestions({ backlogId }: TechStackSuggestionsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [cachedData, setCachedData] = useState<any>(null)
  const [isLoadingCache, setIsLoadingCache] = useState(true)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)

  const { object: suggestions, submit, isLoading, stop } = useObject({
    api: '/api/generate-tech-stack',
    schema: techStackResponseSchema,
    onFinish: async (result) => {
      if (result.object) {
        // Save to cache automatically
        try {
          await fetch('/api/save-tech-stack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              backlogId,
              projectType: result.object.projectType,
              complexity: result.object.complexity,
              estimatedTimeframe: result.object.estimatedTimeframe,
              keyFeatures: result.object.keyFeatures,
              suggestions: result.object.suggestions,
            })
          })
          setLastGenerated(new Date())
          toast.success('Tech stack saved successfully!')
        } catch (error) {
          console.error('Failed to save tech stack:', error)
          toast.error('Failed to save tech stack')
        }
      }
    }
  })

  // Check for cached data on mount
  useEffect(() => {
    const checkCache = async () => {
      try {
        const response = await fetch(`/api/get-cached-tech-stack?backlogId=${backlogId}`)
        const result = await response.json()
        
        if (result.cached && result.data) {
          setCachedData(result.data)
          setLastGenerated(new Date(result.data.cachedAt))
        }
      } catch (error) {
        console.error('Failed to check cache:', error)
      } finally {
        setIsLoadingCache(false)
      }
    }

    checkCache()
  }, [backlogId])

  // Auto-expand all categories when suggestions are available
  useEffect(() => {
    const currentSuggestions = suggestions || cachedData
    if (currentSuggestions?.suggestions) {
      const categories = new Set<string>(currentSuggestions.suggestions.map((s: any) => s.category))
      setExpandedCategories(categories)
    }
  }, [suggestions, cachedData])

  const handleGenerate = () => {
    submit({ backlogId })
  }

  const handleClearCache = async () => {
    setCachedData(null)
    setLastGenerated(null)
    toast.success('Cache cleared')
  }

  const handleExportAsJSON = () => {
    const currentSuggestions = suggestions || cachedData
    if (!currentSuggestions) return
    
    const dataStr = JSON.stringify(currentSuggestions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tech-stack-${backlogId}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Tech stack exported!')
  }

  const handleCopyToClipboard = async () => {
    const currentSuggestions = suggestions || cachedData
    if (!currentSuggestions) return

    const formattedText = `# Tech Stack Recommendations

**Project Type:** ${currentSuggestions.projectType || 'Not specified'}
**Complexity:** ${currentSuggestions.complexity || 'Not specified'}
**Estimated Timeframe:** ${currentSuggestions.estimatedTimeframe || 'Not specified'}

## Key Features
${currentSuggestions.keyFeatures?.map((feature: string) => `- ${feature}`).join('\n') || 'No key features specified'}

## Technology Recommendations
${currentSuggestions.suggestions?.map((suggestion: any) => `
### ${suggestion?.category?.charAt(0).toUpperCase() + suggestion?.category?.slice(1) || 'Technology'}
**Primary:** ${suggestion?.primary || 'Not specified'}
**Alternatives:** ${suggestion?.alternatives?.join(', ') || 'None'}
**Reasoning:** ${suggestion?.reasoning || 'No reasoning provided'}
**Difficulty:** ${suggestion?.difficulty || 'Unknown'}
`).join('\n') || 'No suggestions available'}

Generated on: ${lastGenerated?.toLocaleDateString() || 'Unknown'}`

    await navigator.clipboard.writeText(formattedText)
    toast.success('Copied to clipboard!')
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const currentSuggestions = suggestions || cachedData
  const filteredSuggestions = currentSuggestions?.suggestions?.filter((suggestion: any) =>
    suggestion?.primary?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
    suggestion?.category?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
    (suggestion?.alternatives && Array.isArray(suggestion.alternatives) && 
     suggestion.alternatives.some((alt: string) => alt?.toLowerCase()?.includes(searchQuery.toLowerCase())))
  ) || []

  const groupedSuggestions = filteredSuggestions.reduce((groups: any, suggestion: any) => {
    const category = suggestion?.category
    if (category && !groups[category]) {
      groups[category] = []
    }
    if (category) {
      groups[category].push(suggestion)
    }
    return groups
  }, {})

  if (isLoadingCache) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Checking for cached suggestions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Tech Stack Suggestions
          </h2>
          <p className="text-muted-foreground">
            AI-powered technology recommendations for your project
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {cachedData && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Archive className="h-3 w-3" />
              Cached
            </Badge>
          )}
          {lastGenerated && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {lastGenerated.toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              {cachedData ? 'Regenerate' : 'Generate'} Suggestions
            </>
          )}
        </Button>

        {isLoading && (
          <Button variant="outline" onClick={stop}>
            Stop Generation
          </Button>
        )}

        {currentSuggestions && (
          <>
            <Button variant="outline" onClick={handleExportAsJSON} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            
            <Button variant="outline" onClick={handleCopyToClipboard} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy Text
            </Button>
          </>
        )}

        {cachedData && (
          <Button variant="ghost" onClick={handleClearCache} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Clear Cache
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && !currentSuggestions && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Brain className="h-12 w-12 text-purple-600 animate-pulse" />
                <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Analyzing your project...</h3>
                <p className="text-muted-foreground">
                  Our AI is reviewing your user stories and generating personalized tech stack recommendations
                </p>
              </div>
              <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentSuggestions && (
        <div className="space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Project Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Project Type</div>
                  <div className="text-lg font-semibold">{currentSuggestions.projectType || 'Analyzing...'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Complexity</div>
                  <Badge className={projectComplexityColors[currentSuggestions.complexity as keyof typeof projectComplexityColors] || 'bg-gray-100'}>
                    {currentSuggestions.complexity || 'Determining...'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Estimated Timeframe</div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{currentSuggestions.estimatedTimeframe || 'Calculating...'}</span>
                  </div>
                </div>
              </div>
              
              {currentSuggestions.keyFeatures && currentSuggestions.keyFeatures.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Key Features</div>
                  <div className="flex flex-wrap gap-2">
                    {currentSuggestions.keyFeatures.map((feature: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search and Filters */}
          {currentSuggestions.suggestions && currentSuggestions.suggestions.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search technologies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredSuggestions.length} of {currentSuggestions.suggestions.length} categories
              </div>
            </div>
          )}

          {/* Technology Categories */}
          {Object.entries(groupedSuggestions).map(([category, suggestions]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Settings
            const isExpanded = expandedCategories.has(category)
            
            return (
              <Card key={category}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' & ')}
                          <Badge variant="outline">{(suggestions as any[]).length}</Badge>
                        </CardTitle>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                                                 {(suggestions as any[]).map((suggestion, index) => (
                           <div key={index} className="border rounded-lg p-4 space-y-3">
                             <div className="flex items-center justify-between flex-wrap gap-2">
                               <div className="flex items-center gap-2">
                                 <CheckCircle className="h-4 w-4 text-green-600" />
                                 <span className="font-semibold text-lg">{suggestion?.primary || 'Technology'}</span>
                               </div>
                               <Badge className={complexityColors[suggestion?.difficulty as keyof typeof complexityColors] || 'bg-gray-100'}>
                                 {suggestion?.difficulty || 'Unknown'}
                               </Badge>
                             </div>
                             
                             <p className="text-muted-foreground">{suggestion?.reasoning || 'No reasoning provided'}</p>
                             
                             {suggestion?.alternatives && Array.isArray(suggestion.alternatives) && suggestion.alternatives.length > 0 && (
                               <div>
                                 <div className="text-sm font-medium text-muted-foreground mb-2">Alternatives:</div>
                                 <div className="flex flex-wrap gap-2">
                                   {suggestion.alternatives.map((alt: string, altIndex: number) => (
                                     <Badge key={altIndex} variant="outline">
                                       {alt || 'Alternative'}
                                     </Badge>
                                   ))}
                                 </div>
                               </div>
                             )}
                           </div>
                         ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}

          {filteredSuggestions.length === 0 && searchQuery && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or clear the search to see all suggestions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!currentSuggestions && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tech stack suggestions yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI-powered technology recommendations based on your user stories and project requirements.
            </p>
            <Button onClick={handleGenerate} className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Generate Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 