import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { userStoriesResponseSchema } from '@/lib/schemas/user-story'

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
    const validation = userStoriesResponseSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data format', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { stories } = validation.data

    // Transform stories for database insertion
    const storiesToInsert = stories.map(story => ({
      user_id: user.id,
      title: story.title,
      description: story.description,
      acceptance_criteria: story.acceptanceCriteria,
      status: 'backlog' as const
    }))

    // Insert stories into database
    const { data, error } = await supabase
      .from('user_stories')
      .insert(storiesToInsert)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save stories' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      savedStories: data,
      count: data.length
    })

  } catch (error) {
    console.error('Error saving stories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 