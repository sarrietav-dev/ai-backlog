import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { storyId, status } = body
    
    // Validate inputs
    if (!storyId || !status) {
      return NextResponse.json({ error: 'Story ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['backlog', 'in_progress', 'done']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update the story status
    const { data, error } = await supabase
      .from('user_stories')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .eq('user_id', user.id) // Ensure user can only update their own stories
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update story status' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      story: data
    })

  } catch (error) {
    console.error('Error updating story status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 