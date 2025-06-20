'use client'

import { useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  FileText, 
  Kanban, 
  ArrowLeft,
  Calendar,
  Brain,
  Sparkles
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Backlog } from '@/lib/database.types'
import Link from 'next/link'
import ChatInterface from '@/components/chat-interface'
import StoryManager from '@/components/story-manager'
import TechStackSuggestions from '@/components/tech-stack-suggestions'

interface BacklogViewProps {
  backlog: Backlog
  user: User
}

export default function BacklogView({ backlog, user }: BacklogViewProps) {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/backlogs">
              <ArrowLeft className="w-4 h-4" />
              Back to Backlogs
            </Link>
          </Button>
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{backlog.name}</CardTitle>
                    {backlog.description && (
                      <CardDescription className="text-base mt-1">
                        {backlog.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href={`/backlogs/${backlog.id}/kanban`}>
                    <Kanban className="w-4 h-4" />
                    Kanban Board
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="secondary" className="gap-1">
                <Calendar className="w-3 h-3" />
                Created {new Date(backlog.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for Chat, Stories, and Tech Stack */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="stories" className="gap-2">
            <FileText className="w-4 h-4" />
            User Stories
          </TabsTrigger>
          <TabsTrigger value="techstack" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Tech Stack
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-0">
          <ChatInterface 
            backlog={backlog} 
            user={user} 
          />
        </TabsContent>

        <TabsContent value="stories" className="space-y-0">
          <StoryManager 
            user={user} 
            backlog={backlog}
          />
        </TabsContent>

        <TabsContent value="techstack" className="space-y-0">
          <TechStackSuggestions 
            backlog={backlog}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 