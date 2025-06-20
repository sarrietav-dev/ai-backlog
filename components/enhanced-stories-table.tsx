'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpDown, ArrowUp, ArrowDown, FileText, Sparkles, Loader2 } from 'lucide-react'
import type { UserStory } from '@/lib/database.types'
import type { UserStoryInput } from '@/lib/schemas/user-story'
import type { User } from '@supabase/supabase-js'

interface EnhancedStoriesTableProps {
  savedStories: UserStory[]
  generatingStories: UserStoryInput[]
  isGenerating: boolean
  isGenerationComplete: boolean
  user: User | null
}

type SortField = 'title' | 'created_at' | 'status'
type SortDirection = 'asc' | 'desc'

const statusStyles = {
  backlog: 'bg-muted text-muted-foreground border-muted',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  done: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  generating: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 animate-pulse',
}

const statusLabels = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  done: 'Done',
  generating: 'Generating...',
}

export default function EnhancedStoriesTable({ 
  savedStories, 
  generatingStories, 
  isGenerating, 
  isGenerationComplete,
  user 
}: EnhancedStoriesTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedStory, setExpandedStory] = useState<string | null>(null)

  // Combine saved and generating stories for display
  const allStories = useMemo(() => {
    const combined = [
      // Add generating stories at the top with temporary IDs
      ...generatingStories.map((story, index) => ({
        id: `generating-${index}`,
        title: story.title || 'Generating...',
        description: story.description || 'AI is creating this story...',
        acceptance_criteria: story.acceptanceCriteria || [],
        status: 'generating' as const,
        created_at: new Date().toISOString(),
        user_id: user?.id || '',
        isGenerating: true,
      })),
             // Add saved stories
       ...savedStories.map(story => ({
         ...story,
         acceptance_criteria: (story.acceptance_criteria as string[]) || [],
         isGenerating: false,
       }))
    ]
    return combined
  }, [savedStories, generatingStories, user?.id])

  const sortedStories = useMemo(() => {
    return [...allStories].sort((a, b) => {
      // Always put generating stories first
      if (a.isGenerating && !b.isGenerating) return -1
      if (!a.isGenerating && b.isGenerating) return 1

      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (sortField === 'created_at') {
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [allStories, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />
  }

  const toggleExpanded = (storyId: string) => {
    setExpandedStory(expandedStory === storyId ? null : storyId)
  }

  // Show empty state only when there are no stories at all
  if (allStories.length === 0 && !isGenerating) {
    return (
      <Card className="relative">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No User Stories Yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
                             Generate your first user stories using the AI tool above. Once created, they&apos;ll appear in this backlog table.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative">
      {/* Apple Intelligence-like glow effect */}
      {isGenerationComplete && (
        <div className="absolute -inset-3 rounded-xl opacity-75 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-xl blur-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 via-pink-400/10 to-orange-400/10 rounded-xl blur-md"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 via-purple-300/5 via-pink-300/5 to-orange-300/5 rounded-xl blur-sm"></div>
        </div>
      )}
      
      <Card className={`relative transition-all duration-500 ${isGenerationComplete ? 'shadow-2xl shadow-blue-500/20' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                User Stories Backlog
                {isGenerating && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
                {isGenerationComplete && (
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                )}
              </CardTitle>
              <CardDescription>
                {allStories.length} {allStories.length === 1 ? 'story' : 'stories'} in your backlog
                {generatingStories.length > 0 && (
                  <span className="text-blue-600 dark:text-blue-400 ml-2">
                    • {generatingStories.length} generating
                  </span>
                )}
              </CardDescription>
            </div>
            
            {generatingStories.length > 0 && (
              <Badge 
                variant="outline" 
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 animate-pulse"
              >
                New Stories Incoming...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50%]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('title')}
                      className="h-auto p-0 font-medium hover:text-primary"
                    >
                      Title
                      {getSortIcon('title')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="h-auto p-0 font-medium hover:text-primary"
                    >
                      Status
                      {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('created_at')}
                      className="h-auto p-0 font-medium hover:text-primary"
                    >
                      Created
                      {getSortIcon('created_at')}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStories.map((story, index) => (
                  <TableRowWithAnimation 
                    key={story.id}
                    story={story}
                    isExpanded={expandedStory === story.id}
                    onToggleExpanded={toggleExpanded}
                    isNew={story.isGenerating}
                    delay={story.isGenerating ? index * 200 : 0}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {!user && allStories.length > 0 && (
            <div className="mt-6 p-4 border-2 border-dashed border-primary/20 rounded-lg text-center">
              <p className="text-muted-foreground mb-2">
                💡 Sign in to save generated stories to your permanent backlog
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Separate component for animated table rows
interface ExtendedStory {
  id: string
  title: string
  description: string
  acceptance_criteria: string[]
  status: 'backlog' | 'in_progress' | 'done' | 'generating'
  created_at: string
  user_id: string
  isGenerating: boolean
}

function TableRowWithAnimation({ 
  story, 
  isExpanded, 
  onToggleExpanded, 
  isNew,
  delay 
}: {
  story: ExtendedStory
  isExpanded: boolean
  onToggleExpanded: (id: string) => void
  isNew: boolean
  delay: number
}) {
  const [isVisible, setIsVisible] = useState(!isNew)

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isNew, delay])

  return (
    <>
      <TableRow 
        className={`
          cursor-pointer transition-all duration-500 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          ${isNew ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-l-2 border-l-blue-500' : 'hover:bg-muted/50'}
          ${isExpanded ? 'bg-muted/30' : ''}
        `}
        onClick={() => onToggleExpanded(story.id)}
        style={{
          transitionDelay: isNew ? `${delay}ms` : '0ms'
        }}
      >
        <TableCell className="font-medium">
          <div className="max-w-md">
            <p className={`truncate ${isNew ? 'animate-pulse' : ''}`}>
              {story.title}
            </p>
            {!isExpanded && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {story.description}
              </p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge 
            variant="outline" 
            className={statusStyles[story.status as keyof typeof statusStyles]}
          >
            {statusLabels[story.status as keyof typeof statusLabels]}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {story.isGenerating ? (
            <span className="animate-pulse">Just now</span>
          ) : (
            new Date(story.created_at).toLocaleDateString()
          )}
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpanded(story.id)
            }}
            disabled={story.isGenerating}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="border-t-0">
          <TableCell colSpan={4} className="bg-muted/20 border-l-2 border-l-transparent">
            <div className="space-y-4 py-4 animate-in slide-in-from-top-2 duration-300">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {story.description}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                <ul className="list-disc list-inside space-y-1">
                  {(story.acceptance_criteria || []).map((criteria: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
} 