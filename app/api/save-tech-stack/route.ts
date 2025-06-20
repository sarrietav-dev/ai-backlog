import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      backlogId, 
      projectType, 
      complexity, 
      estimatedTimeframe, 
      keyFeatures, 
      suggestions 
    } = await request.json()

    // Delete any existing suggestions for this backlog
    await supabase
      .from('tech_stack_suggestions')
      .delete()
      .eq('backlog_id', backlogId)
      .eq('user_id', user.id)

    // Insert new suggestion
    const { data, error } = await supabase
      .from('tech_stack_suggestions')
      .insert({
        backlog_id: backlogId,
        user_id: user.id,
        project_type: projectType,
        complexity: complexity,
        estimated_timeframe: estimatedTimeframe,
        key_features: keyFeatures,
        suggestions: suggestions
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving tech stack:', error)
      return NextResponse.json({ error: 'Failed to save tech stack' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in save-tech-stack:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 