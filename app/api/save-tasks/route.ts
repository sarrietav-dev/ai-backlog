import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tasksResponseSchema } from '@/lib/schemas/task'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { userStoryId, ...tasksData } = body
    
    // Validate the request body
    const validation = tasksResponseSchema.safeParse(tasksData)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data format', details: validation.error.issues },
        { status: 400 }
      )
    }

    if (!userStoryId) {
      return NextResponse.json(
        { error: 'User story ID is required' },
        { status: 400 }
      )
    }

    // Verify the user story belongs to the authenticated user
    const { data: userStory, error: storyError } = await supabase
      .from('user_stories')
      .select('id')
      .eq('id', userStoryId)
      .eq('user_id', user.id)
      .single()

    if (storyError || !userStory) {
      return NextResponse.json(
        { error: 'User story not found or access denied' },
        { status: 404 }
      )
    }

    const { tasks } = validation.data

    // Get the current max order_index for this user story
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('order_index')
      .eq('user_story_id', userStoryId)
      .order('order_index', { ascending: false })
      .limit(1)

    const startOrderIndex = existingTasks && existingTasks.length > 0 
      ? existingTasks[0].order_index + 1 
      : 0

    // Transform tasks for database insertion
    const tasksToInsert = tasks.map((task, index) => ({
      user_id: user.id,
      user_story_id: userStoryId,
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      estimated_hours: task.estimatedHours || null,
      status: 'todo' as const,
      order_index: startOrderIndex + index
    }))

    // Insert tasks into database
    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save tasks' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      savedTasks: data,
      count: data.length
    })

  } catch (error) {
    console.error('Error saving tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 