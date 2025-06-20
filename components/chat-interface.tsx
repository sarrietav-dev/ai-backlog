'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, Send, User, Bot, Sparkles } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { toast } from 'sonner'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { Backlog, ChatMessage } from '@/lib/database.types'

interface ChatInterfaceProps {
  backlog: Backlog
  user: AuthUser
}

export default function ChatInterface({ backlog, user }: ChatInterfaceProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [savingChat, setSavingChat] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      backlogId: backlog.id,
    },
    onFinish: async (message) => {
      // Save the conversation to the database
      await saveChatMessageOnly('assistant', message.content)
    },
    onError: (error) => {
      toast.error('Failed to send message. Please try again.')
      console.error('Chat error:', error)
    }
  })

  const loadChatHistory = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('backlog_id', backlog.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading chat history:', error)
      } else {
        setChatHistory(messages || [])
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setLoading(false)
    }
  }, [backlog.id])

  useEffect(() => {
    loadChatHistory()
  }, [loadChatHistory])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, chatHistory])

  const saveChatMessage = async (role: 'user' | 'assistant', content: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          backlog_id: backlog.id,
          user_id: user.id,
          role,
          content,
          metadata: {}
        })

      if (error) {
        console.error('Error saving chat message:', error)
      } else {
        // Refresh chat history
        loadChatHistory()
      }
    } catch (error) {
      console.error('Error saving chat message:', error)
    }
  }

  const saveChatMessageOnly = async (role: 'user' | 'assistant', content: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          backlog_id: backlog.id,
          user_id: user.id,
          role,
          content,
          metadata: {}
        })

      if (error) {
        console.error('Error saving chat message:', error)
      }
      // Don't refresh chat history to avoid infinite loop
    } catch (error) {
      console.error('Error saving chat message:', error)
    }
  }

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Save user message first
    await saveChatMessage('user', input.trim())
    
    // Then submit to AI
    handleSubmit(e)
  }

  const generateStories = async () => {
    if (!messages.length && !chatHistory.length) {
      toast.error('Start a conversation first to generate stories based on the chat context.')
      return
    }

    setSavingChat(true)
    try {
      const response = await fetch('/api/generate-stories-from-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          backlogId: backlog.id,
          messages: [...chatHistory, ...messages] 
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Generated ${result.count} user stories from chat context!`)
        // Optionally switch to stories tab or refresh stories
      } else {
        throw new Error(result.error || 'Failed to generate stories')
      }
    } catch (error) {
      toast.error('Failed to generate stories. Please try again.')
      console.error('Story generation error:', error)
    } finally {
      setSavingChat(false)
    }
  }

  const allMessages = [
    ...chatHistory.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: msg.created_at
    })),
    ...messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: new Date().toISOString()
    }))
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Chat for {backlog.name}
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Discuss your product ideas and generate user stories with context-aware AI
            </p>
            <Button
              onClick={generateStories}
              disabled={savingChat || (!messages.length && !chatHistory.length)}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              {savingChat ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate Stories
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="border rounded-lg">
            <ScrollArea ref={scrollAreaRef} className="h-[400px] p-4">
              {allMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation to discuss your product ideas!</p>
                  <p className="text-sm mt-2">
                    Ask about features, user needs, or anything related to your product.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allMessages.map((message, index) => (
                    <div
                      key={`${message.id}-${index}`}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about features, user needs, technical requirements..."
              className="min-h-[80px] resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleCustomSubmit(e)
                }
              }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {error && (
            <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg">
              Error: {error.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 