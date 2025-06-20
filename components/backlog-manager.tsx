'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, MessageSquare, FileText, Trash2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Backlog } from '@/lib/database.types'
import StoryManager from '@/components/story-manager'
import ChatInterface from '@/components/chat-interface'

interface BacklogManagerProps {
  user: User | null
}

export default function BacklogManager({ user }: BacklogManagerProps) {
  const [backlogs, setBacklogs] = useState<Backlog[]>([])
  const [selectedBacklog, setSelectedBacklog] = useState<Backlog | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBacklogName, setNewBacklogName] = useState('')
  const [newBacklogDescription, setNewBacklogDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const loadBacklogs = useCallback(async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data: backlogsData, error } = await supabase
        .from('backlogs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching backlogs:', error)
      } else {
        setBacklogs(backlogsData || [])
        // Auto-select the first backlog if none selected
        if (!selectedBacklog && backlogsData && backlogsData.length > 0) {
          setSelectedBacklog(backlogsData[0])
        }
      }
    } catch (error) {
      console.error('Error loading backlogs:', error)
    } finally {
      setLoading(false)
    }
  }, [user, selectedBacklog])

  useEffect(() => {
    if (user) {
      loadBacklogs()
    } else {
      setLoading(false)
    }
  }, [user, loadBacklogs])

  const createBacklog = async () => {
    if (!user || !newBacklogName.trim()) return

    setCreating(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('backlogs')
        .insert({
          user_id: user.id,
          name: newBacklogName.trim(),
          description: newBacklogDescription.trim() || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating backlog:', error)
      } else {
        setBacklogs(prev => [data, ...prev])
        setSelectedBacklog(data)
        setIsCreateDialogOpen(false)
        setNewBacklogName('')
        setNewBacklogDescription('')
      }
    } catch (error) {
      console.error('Error creating backlog:', error)
    } finally {
      setCreating(false)
    }
  }

  const deleteBacklog = async (backlog: Backlog) => {
    if (!user || !confirm('Are you sure you want to delete this backlog? This will also delete all stories and chat history.')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('backlogs')
        .delete()
        .eq('id', backlog.id)

      if (error) {
        console.error('Error deleting backlog:', error)
      } else {
        const updatedBacklogs = backlogs.filter(b => b.id !== backlog.id)
        setBacklogs(updatedBacklogs)
        
        // If deleted backlog was selected, select another one
        if (selectedBacklog?.id === backlog.id) {
          setSelectedBacklog(updatedBacklogs.length > 0 ? updatedBacklogs[0] : null)
        }
      }
    } catch (error) {
      console.error('Error deleting backlog:', error)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please sign in to manage your backlogs and generate user stories.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Backlog Header & Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Product Backlogs
              </CardTitle>
              <CardDescription>
                Manage multiple product backlogs with AI-generated user stories and contextual chat
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Backlog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Backlog</DialogTitle>
                  <DialogDescription>
                    Create a new product backlog to organize your user stories and chat conversations.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={newBacklogName}
                      onChange={(e) => setNewBacklogName(e.target.value)}
                      placeholder="e.g., Mobile App, Web Platform, API Service"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newBacklogDescription}
                      onChange={(e) => setNewBacklogDescription(e.target.value)}
                      placeholder="Brief description of this product or feature set..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createBacklog}
                      disabled={!newBacklogName.trim() || creating}
                    >
                      {creating ? 'Creating...' : 'Create Backlog'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {backlogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No backlogs yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first backlog to start generating user stories with AI.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Select Backlog:</label>
                <Select
                  value={selectedBacklog?.id || ''}
                  onValueChange={(value) => {
                    const backlog = backlogs.find(b => b.id === value)
                    setSelectedBacklog(backlog || null)
                  }}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a backlog" />
                  </SelectTrigger>
                  <SelectContent>
                    {backlogs.map((backlog) => (
                      <SelectItem key={backlog.id} value={backlog.id}>
                        {backlog.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Backlog Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {backlogs.map((backlog) => (
                  <Card 
                    key={backlog.id} 
                    className={`cursor-pointer transition-all ${
                      selectedBacklog?.id === backlog.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedBacklog(backlog)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{backlog.name}</CardTitle>
                          {backlog.description && (
                            <CardDescription className="text-sm">
                              {backlog.description}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteBacklog(backlog)
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Badge variant="secondary" className="text-xs">
                        Created {new Date(backlog.created_at).toLocaleDateString()}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Backlog Content */}
      {selectedBacklog && (
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-2">
              <FileText className="w-4 h-4" />
              User Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatInterface 
              backlog={selectedBacklog} 
              user={user} 
            />
          </TabsContent>

          <TabsContent value="stories">
            <StoryManager 
              user={user} 
              backlog={selectedBacklog}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 