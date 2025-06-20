import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages, backlogId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages', { status: 400 })
    }

    if (!backlogId) {
      return new Response('Backlog ID is required', { status: 400 })
    }

    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Authentication required', { status: 401 })
    }

    // Get backlog information
    const { data: backlog, error: backlogError } = await supabase
      .from('backlogs')
      .select('*')
      .eq('id', backlogId)
      .eq('user_id', user.id)
      .single()

    if (backlogError || !backlog) {
      return new Response('Backlog not found', { status: 404 })
    }

    // Get existing chat messages for context
    const { data: chatHistory, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('backlog_id', backlogId)
      .order('created_at', { ascending: true })
      .limit(20) // Limit to last 20 messages for context

    if (chatError) {
      console.error('Error fetching chat history:', chatError)
    }

    // Get existing user stories for this backlog for additional context
    const { data: existingStories, error: storiesError } = await supabase
      .from('user_stories')
      .select('title, description, acceptance_criteria')
      .eq('backlog_id', backlogId)
      .limit(10) // Latest 10 stories for context

    if (storiesError) {
      console.error('Error fetching existing stories:', storiesError)
    }

    // Build context for AI
    let contextPrompt = `You are a senior Product Manager AI assistant helping with the "${backlog.name}" product backlog.`
    
    if (backlog.description) {
      contextPrompt += `\n\nBacklog Description: ${backlog.description}`
    }

    if (existingStories && existingStories.length > 0) {
      contextPrompt += `\n\nExisting User Stories in this backlog:`
      existingStories.forEach((story, index) => {
        contextPrompt += `\n${index + 1}. ${story.title}`
        contextPrompt += `\n   Description: ${story.description}`
        if (story.acceptance_criteria && Array.isArray(story.acceptance_criteria)) {
          contextPrompt += `\n   Acceptance Criteria: ${story.acceptance_criteria.join(', ')}`
        }
      })
    }

    // Add chat history to messages for context
    const conversationMessages = []
    
    // Add system prompt with context
    conversationMessages.push({
      role: 'system',
      content: `${contextPrompt}

You are having a conversation about this product. Your role is to:
1. Help clarify product requirements and features
2. Ask insightful questions about user needs and business goals
3. Suggest improvements or alternative approaches
4. Provide expert product management advice
5. Help identify edge cases and potential issues
6. Discuss technical feasibility when relevant

Keep your responses conversational, helpful, and focused on product development. Reference existing stories and context when relevant. Ask follow-up questions to better understand the user's needs.`
    })

    // Add recent chat history for context
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        conversationMessages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }

    // Add current messages
    conversationMessages.push(...messages)

    const result = streamText({
      model: openai('gpt-4o'),
      messages: conversationMessages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response('Failed to process chat message', { status: 500 })
  }
} 