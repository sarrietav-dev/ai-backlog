import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { taskGenerationRequestSchema, tasksResponseSchema } from '@/lib/schemas/task'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    
    // Validate the request body
    const validation = taskGenerationRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { userStoryId, context } = validation.data

    // Fetch the user story
    const { data: userStory, error: storyError } = await supabase
      .from('user_stories')
      .select('*')
      .eq('id', userStoryId)
      .eq('user_id', user.id)
      .single()

    if (storyError || !userStory) {
      return NextResponse.json(
        { error: 'User story not found' },
        { status: 404 }
      )
    }

    // Fetch existing tasks for this user story to avoid duplication
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('title, description')
      .eq('user_story_id', userStoryId)
      .eq('user_id', user.id)

    let systemPrompt = `You are an experienced Software Development Lead breaking down user stories into actionable tasks.

USER STORY TO BREAK DOWN:
Title: ${userStory.title}
Description: ${userStory.description}
Acceptance Criteria: ${JSON.stringify(userStory.acceptance_criteria)}

RULES FOR TASK GENERATION:
1. Generate 3-8 specific, actionable development tasks
2. Each task should be completable in 1-8 hours
3. Tasks should follow software development best practices
4. Include tasks for: implementation, testing, documentation, and code review
5. Consider different aspects: frontend, backend, database, API, testing, deployment
6. Make tasks specific and measurable
7. Prioritize tasks appropriately (low, medium, high, critical)
8. Provide realistic hour estimates for each task
9. Tasks should cover the full development lifecycle for this story

TASK CATEGORIES TO CONSIDER:
- Analysis & Planning
- Database/Schema changes
- Backend API development
- Frontend implementation
- Unit testing
- Integration testing
- Documentation
- Code review
- Deployment preparation`

    if (context) {
      systemPrompt += `\n\nADDITIONAL CONTEXT: ${context}`
    }

    if (existingTasks && existingTasks.length > 0) {
      systemPrompt += `\n\nEXISTING TASKS TO AVOID DUPLICATION:
${existingTasks.map(task => `- ${task.title}: ${task.description}`).join('\n')}`
    }

    systemPrompt += `\n\nReturn ONLY valid JSON that matches the expected schema. No additional text or formatting.`

    // Generate tasks using AI
    const result = streamObject({
      model: openai('gpt-4o-mini'), // Cost-effective model
      system: systemPrompt,
      prompt: `Break down this user story into specific, actionable development tasks that cover the complete implementation lifecycle.`,
      schema: tasksResponseSchema,
    })

    return result.toTextStreamResponse()

  } catch (error) {
    console.error('Error generating tasks:', error)
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    )
  }
} 