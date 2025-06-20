import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const backlogId = searchParams.get('backlogId')

    if (!backlogId) {
      return NextResponse.json({ error: 'Backlog ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tech_stack_suggestions')
      .select('*')
      .eq('backlog_id', backlogId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching cached tech stack:', error)
      return NextResponse.json({ error: 'Failed to fetch cached tech stack' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ cached: false })
    }

    return NextResponse.json({ 
      cached: true, 
      data: {
        ...data,
        projectType: data.project_type,
        estimatedTimeframe: data.estimated_timeframe,
        keyFeatures: data.key_features,
        cachedAt: data.created_at
      }
    })
  } catch (error) {
    console.error('Error in get-cached-tech-stack:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 