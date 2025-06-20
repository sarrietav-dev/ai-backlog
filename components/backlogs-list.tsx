'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  FileText, 
  Trash2, 
  MessageSquare, 
  Kanban, 
  Calendar,
  Brain
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Backlog } from '@/lib/database.types'
import Link from 'next/link'
import { toast } from 'sonner'

interface BacklogsListProps {
  user: User | null
}

export default function BacklogsList({ user }: BacklogsListProps) {
  const [backlogs, setBacklogs] = useState<Backlog[]>([])
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
        toast.error('Failed to load backlogs')
      } else {
        setBacklogs(backlogsData || [])
      }
    } catch (error) {
      console.error('Error loading backlogs:', error)
      toast.error('Failed to load backlogs')
    } finally {
      setLoading(false)
    }
  }, [user])

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
        toast.error('Failed to create backlog')
      } else {
        setBacklogs(prev => [data, ...prev])
        setIsCreateDialogOpen(false)
        setNewBacklogName('')
        setNewBacklogDescription('')
        toast.success('Backlog created successfully!')
      }
    } catch (error) {
      console.error('Error creating backlog:', error)
      toast.error('Failed to create backlog')
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
        toast.error('Failed to delete backlog')
      } else {
        setBacklogs(prev => prev.filter(b => b.id !== backlog.id))
        toast.success('Backlog deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting backlog:', error)
      toast.error('Failed to delete backlog')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-6"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            My Product Backlogs
          </h1>
          <p className="text-muted-foreground">
            Manage your product backlogs, generate user stories with AI, and track progress
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              New Backlog
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Backlog</DialogTitle>
              <DialogDescription>
                Create a new product backlog to organize your user stories and chat conversations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  value={newBacklogDescription}
                  onChange={(e) => setNewBacklogDescription(e.target.value)}
                  placeholder="Brief description of this product or feature set..."
                  className="mt-1"
                  rows={3}
                />
              </div>
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Backlogs Grid */}
      {backlogs.length === 0 ? (
        <Card className="bg-gradient-to-br from-muted/30 to-muted/10">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-muted rounded-full">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No backlogs yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create your first product backlog to start generating user stories with AI and managing your project.
                </p>
              </div>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Backlog
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {backlogs.map((backlog) => (
            <Card 
              key={backlog.id} 
              className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-muted/5 border-0 shadow-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {backlog.name}
                    </CardTitle>
                    {backlog.description && (
                      <CardDescription className="text-sm leading-relaxed">
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
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created {new Date(backlog.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 gap-2">
                    <Link href={`/backlogs/${backlog.id}`}>
                      <MessageSquare className="w-4 h-4" />
                      Chat & Stories
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 gap-2">
                    <Link href={`/backlogs/${backlog.id}/kanban`}>
                      <Kanban className="w-4 h-4" />
                      Kanban
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 