import { NextRequest } from 'next/server'
import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { userStoriesResponseSchema } from '@/lib/schemas/user-story'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return new Response('Invalid prompt', { status: 400 })
    }

    // Check authentication (optional - will work without auth but won't save)
    const supabase = await createClient()
    await supabase.auth.getUser()

    const result = streamObject({
      model: openai('gpt-4o-mini'), // 90% cost reduction with minimal quality loss
      system: `You are a seasoned Product Manager with expertise in writing clear, actionable user stories. 
        
Your task is to analyze the user's product idea and generate a comprehensive backlog of user stories.

RULES:
1. Generate 5-8 user stories maximum
2. Each story must follow the format: "As a [user type], I want [goal] so that [benefit]"
3. Stories should be ordered by priority (most important first)
4. Each story needs 2-4 specific, testable acceptance criteria
5. Focus on MVP (Minimum Viable Product) features first
6. Include both core functionality and basic user experience features
7. Make acceptance criteria specific and measurable
8. Consider different user types (end users, admins, etc.)

EXAMPLE OUTPUT:
{
  "stories": [
    {
      "title": "As a dog owner, I want to view available time slots so that I can book a convenient appointment",
      "description": "Users need to see available appointment times from dog walkers to schedule services that fit their schedule.",
      "acceptanceCriteria": [
        "Display available time slots in a calendar view",
        "Show walker availability for next 14 days",
        "Filter by preferred time of day (morning, afternoon, evening)",
        "Indicate already booked slots clearly"
      ]
    }
  ]
}

Return ONLY valid JSON that matches the expected schema. No additional text or formatting.`,
      prompt: `Generate user stories for this product idea: ${prompt}`,
      schema: userStoriesResponseSchema,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating stories:', error)
    return new Response('Failed to generate stories', { status: 500 })
  }
} 