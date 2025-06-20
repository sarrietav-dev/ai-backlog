import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { techStackResponseSchema } from '@/lib/schemas/tech-stack'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    
    // useObject sends the data directly, not nested in a body object
    let backlogId: string
    if (typeof body === 'string') {
      backlogId = body
    } else if (body.backlogId) {
      backlogId = body.backlogId
    } else {
      console.error('Invalid request format:', body)
      return NextResponse.json(
        { error: 'Missing backlogId in request' },
        { status: 400 }
      )
    }

    // Fetch the backlog and its stories
    const { data: backlog, error: backlogError } = await supabase
      .from('backlogs')
      .select(`
        *,
        user_stories (
          title,
          description,
          acceptance_criteria
        )
      `)
      .eq('id', backlogId)
      .eq('user_id', user.id)
      .single()

    if (backlogError || !backlog) {
      return NextResponse.json({ error: 'Backlog not found' }, { status: 404 })
    }

    // Prepare the context for AI analysis
    const projectContext = `
PROJECT: ${backlog.name}
DESCRIPTION: ${backlog.description}

USER STORIES:
${backlog.user_stories?.map((story, index) => `
${index + 1}. ${story.title}
   Description: ${story.description}
   Acceptance Criteria: ${Array.isArray(story.acceptance_criteria) ? story.acceptance_criteria.join(', ') : 'None specified'}
`).join('\n') || 'No user stories available'}
    `.trim()

    const systemPrompt = `You are a senior software architect and technology consultant with deep expertise across modern web development, mobile development, and enterprise software solutions.

Analyze the provided project details and user stories to suggest an optimal technology stack.

ANALYSIS GUIDELINES:
1. Consider the project's scope, complexity, and requirements
2. Suggest technologies that align with the features described in user stories
3. Prioritize modern, well-supported technologies with good community support
4. Consider scalability, maintainability, and development speed
5. Suggest specific tools and frameworks, not just general categories
6. Provide clear reasoning for each technology choice
7. Consider both MVP and future scaling needs

TECHNOLOGY CATEGORIES TO CONSIDER:
- Frontend: React, Vue, Angular, Svelte, Next.js, Nuxt.js, etc.
- Backend: Node.js, Python (Django/FastAPI), Ruby on Rails, Go, Java Spring, .NET, etc.
- Database: PostgreSQL, MongoDB, Redis, Firebase, Supabase, etc.
- Hosting: Vercel, Netlify, AWS, Google Cloud, Railway, etc.
- Mobile: React Native, Flutter, Swift, Kotlin, etc.
- AI/ML: OpenAI, Anthropic, Google AI, TensorFlow, PyTorch, etc.
- Authentication: Auth0, Firebase Auth, Supabase Auth, NextAuth.js, etc.
- Payment: Stripe, PayPal, Square, etc.
- Storage: AWS S3, Cloudinary, Firebase Storage, etc.
- Analytics: Google Analytics, Mixpanel, PostHog, etc.
- Monitoring: Sentry, LogRocket, DataDog, etc.

COMPLEXITY ASSESSMENT:
- Simple: Basic CRUD operations, simple UI, minimal integrations
- Moderate: Multiple user types, real-time features, third-party integrations
- Complex: Advanced AI features, complex business logic, enterprise integrations

Return a comprehensive technology stack recommendation with specific tools and clear reasoning for each choice.`

    console.log('Generating tech stack for backlog:', backlogId)
    console.log('Project context:', projectContext.substring(0, 200) + '...')

    const result = streamObject({
      model: openai('gpt-4o'),
      system: systemPrompt,
      prompt: `Analyze this project and recommend an optimal technology stack:\n\n${projectContext}`,
      schema: techStackResponseSchema,
    })

    const response = result.toTextStreamResponse()
    console.log('Streaming response created successfully')
    return response

  } catch (error) {
    console.error('Error generating tech stack:', error)
    return NextResponse.json(
      { error: 'Failed to generate tech stack suggestions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 