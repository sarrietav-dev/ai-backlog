import { NextRequest, NextResponse } from 'next/server'
import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { userStoriesResponseSchema } from '@/lib/schemas/user-story'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { backlogId, messages } = await req.json()

    if (!backlogId) {
      return NextResponse.json({ error: 'Backlog ID is required' }, { status: 400 })
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Chat messages are required' }, { status: 400 })
    }

    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get backlog information
    const { data: backlog, error: backlogError } = await supabase
      .from('backlogs')
      .select('*')
      .eq('id', backlogId)
      .eq('user_id', user.id)
      .single()

    if (backlogError || !backlog) {
      return NextResponse.json({ error: 'Backlog not found' }, { status: 404 })
    }

    // Get existing user stories to avoid duplication
    const { data: existingStories, error: storiesError } = await supabase
      .from('user_stories')
      .select('title, description')
      .eq('backlog_id', backlogId)

    if (storiesError) {
      console.error('Error fetching existing stories:', storiesError)
    }

    // Build conversation context for AI
    const conversationContext = messages
      .filter(msg => msg.content && msg.content.trim())
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n')

    let systemPrompt = `You are a seasoned Product Manager analyzing a conversation about the "${backlog.name}" product backlog.

Based on the conversation below, generate specific, actionable user stories that capture the discussed requirements and features.

CONVERSATION CONTEXT:
${conversationContext}

RULES:
1. Generate 3-6 user stories based on the conversation
2. Each story must follow the format: "As a [user type], I want [goal] so that [benefit]"
3. Stories should be specific to what was discussed in the conversation
4. Each story needs 2-4 specific, testable acceptance criteria
5. Focus on the most important features mentioned in the conversation
6. Make acceptance criteria specific and measurable
7. Consider different user types mentioned in the conversation`

    if (existingStories && existingStories.length > 0) {
      systemPrompt += `\n\nEXISTING STORIES TO AVOID DUPLICATION:
${existingStories.map(story => `- ${story.title}: ${story.description}`).join('\n')}`
    }

    systemPrompt += `\n\nReturn ONLY valid JSON that matches the expected schema. No additional text or formatting.`

    // Generate stories using AI
    const result = streamObject({
      model: openai('gpt-4o-mini'), // 90% cost reduction
      system: systemPrompt,
      prompt: `Analyze the conversation and generate user stories based on the discussed features and requirements.`,
      schema: userStoriesResponseSchema,
    })

    // Convert to text stream and then save to database
    const response = result.toTextStreamResponse()
    
    // Since we're streaming, we need to handle the completion differently
    // For now, let's return the stream and handle saving in the frontend
    return response

  } catch (error) {
    console.error('Error generating stories from chat:', error)
    return NextResponse.json(
      { error: 'Failed to generate stories from chat' },
      { status: 500 }
    )
  }
} 