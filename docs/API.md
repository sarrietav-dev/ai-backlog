# 📚 API Documentation

## Overview

The AI Product Backlog API provides endpoints for managing backlogs, user stories, and AI-powered conversations. All endpoints require authentication except for the story generation endpoint which works without auth but won't save data.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.vercel.app`

## Authentication

The API uses Supabase Auth with GitHub OAuth. Authentication is handled via HTTP-only cookies for security.

### Headers

```http
Content-Type: application/json
```

Authentication cookies are automatically handled by the browser.

## Endpoints

### 🤖 AI Chat

#### POST `/api/chat`

Start or continue a conversation with AI about a specific backlog.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I want to build a task management app"
    }
  ],
  "backlogId": "uuid-of-backlog"
}
```

**Parameters:**
- `messages` (array, required): Array of chat messages with role ('user' | 'assistant') and content
- `backlogId` (string, required): UUID of the backlog for context

**Response:**
- Streaming text response from OpenAI
- Content-Type: `text/plain; charset=utf-8`

**Example:**
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'How should I prioritize features?' }],
    backlogId: 'abc-123-def'
  })
})

// Handle streaming response
const reader = response.body.getReader()
// Process streaming data...
```

**Error Responses:**
- `400`: Invalid messages or missing backlogId
- `401`: Authentication required
- `404`: Backlog not found
- `500`: Internal server error

---

### ⚡ Story Generation

#### POST `/api/generate-stories`

Generate user stories from a text prompt.

**Request Body:**
```json
{
  "prompt": "I want to build a web app for booking dog walking appointments"
}
```

**Parameters:**
- `prompt` (string, required): Description of the product or feature

**Response:**
Streaming JSON response with generated stories:

```json
{
  "stories": [
    {
      "title": "As a dog owner, I want to view available time slots so that I can book a convenient appointment",
      "description": "Users need to see available appointment times from dog walkers to schedule services that fit their schedule.",
      "acceptanceCriteria": [
        "Display available time slots in a calendar view",
        "Show walker availability for next 14 days",
        "Filter by preferred time of day",
        "Indicate already booked slots clearly"
      ]
    }
  ]
}
```

**Example:**
```javascript
const response = await fetch('/api/generate-stories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A social media app for dog lovers'
  })
})

// Handle streaming JSON
const reader = response.body.getReader()
// Process streaming data...
```

**Error Responses:**
- `400`: Invalid or missing prompt
- `500`: AI generation failed

---

#### POST `/api/generate-stories-from-chat`

Generate user stories based on chat conversation context.

**Request Body:**
```json
{
  "backlogId": "uuid-of-backlog",
  "messages": [
    {
      "role": "user",
      "content": "I want a simple task manager"
    },
    {
      "role": "assistant", 
      "content": "What team size are you targeting?"
    }
  ]
}
```

**Parameters:**
- `backlogId` (string, required): UUID of the backlog
- `messages` (array, required): Conversation history to generate stories from

**Response:**
Same format as `/api/generate-stories` but stories are generated based on conversation context.

**Error Responses:**
- `400`: Invalid backlogId or messages
- `401`: Authentication required
- `404`: Backlog not found
- `500`: Story generation failed

---

### 🗃️ Database Operations

The following operations are handled through Supabase client-side SDK, but here's the data model:

#### Backlogs

**Schema:**
```typescript
interface Backlog {
  id: string
  user_id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}
```

**Operations:**
- `SELECT`: Get user's backlogs
- `INSERT`: Create new backlog
- `UPDATE`: Update backlog details
- `DELETE`: Delete backlog (cascades to stories and chat messages)

#### User Stories

**Schema:**
```typescript
interface UserStory {
  id: string
  backlog_id: string
  user_id: string
  title: string
  description: string
  acceptance_criteria: string[]
  status: 'backlog' | 'in_progress' | 'done'
  created_at: string
  updated_at: string
}
```

**Operations:**
- `SELECT`: Get stories for a backlog
- `INSERT`: Create new story
- `UPDATE`: Update story details or status
- `DELETE`: Delete story

#### Chat Messages

**Schema:**
```typescript
interface ChatMessage {
  id: string
  backlog_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  metadata: Record<string, any>
  created_at: string
}
```

**Operations:**
- `SELECT`: Get chat history for a backlog
- `INSERT`: Save new chat message

---

## Rate Limits

To manage costs and prevent abuse:

- **Chat API**: 30 requests per hour per user
- **Story Generation**: 20 requests per hour per user
- **Database Operations**: 1000 requests per hour per user

Rate limits can be adjusted in the middleware configuration.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details (optional)"
}
```

**Common Error Codes:**
- `AUTHENTICATION_REQUIRED`: User must be signed in
- `INVALID_REQUEST`: Request body is malformed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `PERMISSION_DENIED`: User doesn't have access to resource
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `AI_SERVICE_ERROR`: OpenAI API error
- `DATABASE_ERROR`: Supabase database error

## SDK Usage Examples

### React Hook for Chat

```typescript
import { useChat } from '@ai-sdk/react'

function ChatComponent({ backlogId }: { backlogId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { backlogId },
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} />
      <button disabled={isLoading}>Send</button>
    </form>
  )
}
```

### Supabase Database Operations

```typescript
import { createClient } from '@/lib/supabase/client'

// Get backlogs
const supabase = createClient()
const { data: backlogs, error } = await supabase
  .from('backlogs')
  .select('*')
  .order('created_at', { ascending: false })

// Create new story
const { data, error } = await supabase
  .from('user_stories')
  .insert({
    backlog_id: backlogId,
    title: 'Story title',
    description: 'Story description',
    acceptance_criteria: ['Criteria 1', 'Criteria 2'],
    status: 'backlog'
  })

// Update story status
const { error } = await supabase
  .from('user_stories')
  .update({ status: 'in_progress' })
  .eq('id', storyId)
```

## Webhooks

Currently not implemented, but planned webhooks:

- `story.created`: When a new story is generated
- `chat.message`: When a new chat message is sent
- `backlog.updated`: When backlog metadata changes

## OpenAPI Specification

For a complete OpenAPI 3.0 specification, see [api-spec.yaml](./api-spec.yaml).

## Testing

API endpoints can be tested using:

```bash
# Install dependencies
npm install

# Run API tests
npm run test:api

# Test specific endpoint
curl -X POST http://localhost:3000/api/generate-stories \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test product idea"}'
```

## Cost Monitoring

Monitor API usage and costs:

1. **OpenAI Usage**: [platform.openai.com/usage](https://platform.openai.com/usage)
2. **Supabase Usage**: Supabase Dashboard → Settings → Usage
3. **Vercel Analytics**: Vercel Dashboard → Analytics

Set up alerts when approaching limits to prevent unexpected charges. 