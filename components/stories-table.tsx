'use client'

import { useState, useMemo } from 'react'
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
import { ArrowUpDown, ArrowUp, ArrowDown, FileText } from 'lucide-react'
import type { UserStory } from '@/lib/database.types'

interface StoriesTableProps {
  stories: UserStory[]
}

type SortField = 'title' | 'created_at' | 'status'
type SortDirection = 'asc' | 'desc'

const statusStyles = {
  backlog: 'bg-muted text-muted-foreground border-muted',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  done: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
}

const statusLabels = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  done: 'Done',
}

export default function StoriesTable({ stories }: StoriesTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedStory, setExpandedStory] = useState<string | null>(null)

  const sortedStories = useMemo(() => {
    return [...stories].sort((a, b) => {
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
  }, [stories, sortField, sortDirection])

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

  if (stories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No user stories yet. Generate some stories to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your User Stories</CardTitle>
        <CardDescription>
          {stories.length} {stories.length === 1 ? 'story' : 'stories'} in your backlog
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('title')}
                    className="h-auto p-0 font-medium"
                  >
                    Title
                    {getSortIcon('title')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-medium"
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('created_at')}
                    className="h-auto p-0 font-medium"
                  >
                    Created
                    {getSortIcon('created_at')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStories.map((story) => (
                <>
                  <TableRow 
                    key={story.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleExpanded(story.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="max-w-md">
                        <p className="truncate">{story.title}</p>
                        {expandedStory !== story.id && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {story.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={statusStyles[story.status]}
                      >
                        {statusLabels[story.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(story.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpanded(story.id)
                        }}
                      >
                        {expandedStory === story.id ? 'Collapse' : 'Expand'}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedStory === story.id && (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-muted/20">
                        <div className="space-y-4 py-4">
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">
                              {story.description}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {(story.acceptance_criteria as string[]).map((criteria, index) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 