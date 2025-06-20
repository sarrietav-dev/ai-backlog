# 💰 Cost Optimization Guide

## Overview

This guide helps you deploy and run AI Product Backlog with minimal costs while maintaining functionality and user experience. We'll cover free tier optimization, alternative services, and strategies to keep costs under $10/month.

## 🆓 Free Tier Breakdown

### Vercel (Free Plan)
- ✅ **100GB bandwidth/month** (sufficient for ~10k users)
- ✅ **Unlimited static files** (images, CSS, JS)
- ✅ **Serverless Functions** (10-second timeout)
- ✅ **Edge Functions** (1 million invocations/month)
- ✅ **Custom domains** (1 domain)
- ✅ **Preview deployments** (unlimited)

**Estimated User Capacity**: 5,000-10,000 monthly active users

### Supabase (Free Plan)
- ✅ **500MB database storage** (~10,000 user stories)
- ✅ **50MB file storage** (profile images, exports)
- ✅ **50,000 monthly active users**
- ✅ **500,000 Edge Function invocations**
- ✅ **2GB bandwidth/month**
- ⚠️ **2 projects maximum**

**Estimated Capacity**: 
- 50,000 users
- 500,000 chat messages/month
- 100,000 user stories

### OpenAI Costs (Pay-per-use)

| Model | Input Cost (per 1K tokens) | Output Cost (per 1K tokens) | Use Case |
|-------|----------------------------|------------------------------|----------|
| GPT-4o | $0.0025 | $0.0100 | High-quality responses |
| GPT-4o-mini | $0.000150 | $0.000600 | Cost-optimized (90% cheaper) |
| GPT-3.5-turbo | $0.0005 | $0.0015 | Basic conversations |

**Example Monthly Costs** (1,000 conversations):
- GPT-4o: ~$25-50/month
- GPT-4o-mini: ~$3-7/month 🎯
- GPT-3.5-turbo: ~$2-5/month

## 🔧 Cost Reduction Strategies

### 1. Switch to GPT-4o-mini

**Immediate 90% cost reduction** with minimal quality loss.

**Update API routes:**

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai'

const result = await streamText({
  // model: openai('gpt-4o'), // $25-50/month
  model: openai('gpt-4o-mini'), // $3-7/month ✅
  messages: conversationMessages,
  temperature: 0.7,
  maxTokens: 800, // Reduced from 1000
})
```

```typescript
// app/api/generate-stories/route.ts
const result = streamObject({
  // model: openai('gpt-4o'),
  model: openai('gpt-4o-mini'), // ✅ Much cheaper
  system: systemPrompt,
  prompt: `Generate user stories for: ${prompt}`,
  schema: userStoriesResponseSchema,
})
```

**Quality comparison:**
- **GPT-4o**: Excellent reasoning, perfect format
- **GPT-4o-mini**: Good reasoning, occasional format issues
- **Recommendation**: Use GPT-4o-mini for 90% of requests, GPT-4o for complex edge cases

### 2. Implement Smart Caching

Cache responses to avoid duplicate AI requests:

```typescript
// lib/cache.ts
import { createHash } from 'crypto'

// Simple in-memory cache (development)
const cache = new Map<string, any>()

// Redis cache (production) - Use Upstash free tier
import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()

export async function getCachedResponse(prompt: string) {
  const key = createHash('md5').update(prompt).digest('hex')
  
  // Try memory cache first
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  // Try Redis cache
  const cached = await redis.get(key)
  if (cached) {
    cache.set(key, cached) // Populate memory cache
    return cached
  }
  
  return null
}

export async function setCachedResponse(prompt: string, response: any) {
  const key = createHash('md5').update(prompt).digest('hex')
  
  cache.set(key, response)
  await redis.setex(key, 3600, JSON.stringify(response)) // 1 hour TTL
}
```

**Usage in API routes:**

```typescript
// app/api/generate-stories/route.ts
export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  
  // Check cache first
  const cached = await getCachedResponse(prompt)
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Generate new response
  const result = await streamObject({
    model: openai('gpt-4o-mini'),
    prompt: `Generate user stories for: ${prompt}`,
    schema: userStoriesResponseSchema,
  })
  
  // Cache the response
  const response = await result.toObject()
  await setCachedResponse(prompt, response)
  
  return new Response(JSON.stringify(response))
}
```

### 3. Add Rate Limiting

Prevent cost spikes from abuse:

```bash
npm install @upstash/ratelimit
```

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
  analytics: true,
})

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/chat') || 
      request.nextUrl.pathname.startsWith('/api/generate-stories')) {
    
    const ip = request.ip ?? '127.0.0.1'
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      )
    }

    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())
    
    return response
  }
}

export const config = {
  matcher: '/api/:path*',
}
```

### 4. Optimize Token Usage

Reduce tokens sent to OpenAI:

```typescript
// lib/prompt-optimization.ts
export function optimizePrompt(prompt: string): string {
  return prompt
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 2000) // Limit length
}

export function truncateConversation(messages: any[], maxTokens: number = 2000): any[] {
  // Keep system message + last N messages that fit in token limit
  const systemMessage = messages.find(m => m.role === 'system')
  const otherMessages = messages.filter(m => m.role !== 'system')
  
  // Estimate tokens (rough: 1 token ≈ 4 characters)
  let tokenCount = 0
  const truncated = []
  
  for (let i = otherMessages.length - 1; i >= 0; i--) {
    const estimatedTokens = otherMessages[i].content.length / 4
    if (tokenCount + estimatedTokens > maxTokens) break
    
    truncated.unshift(otherMessages[i])
    tokenCount += estimatedTokens
  }
  
  return systemMessage ? [systemMessage, ...truncated] : truncated
}
```

### 5. Set OpenAI Spending Limits

1. Go to [OpenAI Usage Dashboard](https://platform.openai.com/usage)
2. Set monthly budget: **$10-20/month**
3. Enable usage alerts at 50% and 80%
4. Set hard limits to prevent overages

```typescript
// lib/openai-config.ts
export const OPENAI_CONFIG = {
  maxTokens: 800, // Reduced from default
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0.1, // Reduce repetition
  presencePenalty: 0.1,
  timeout: 30000, // 30 second timeout
}
```

## 🆓 Alternative AI Providers

### 1. Groq (Much Faster & Cheaper)

Groq offers extremely fast inference with competitive pricing:

```bash
npm install groq-sdk
```

```typescript
// lib/groq-client.ts
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateWithGroq(prompt: string) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a product management expert." },
      { role: "user", content: prompt }
    ],
    model: "llama-3.1-70b-versatile", // Very competitive pricing
    temperature: 0.7,
    max_tokens: 800,
  })
  
  return completion.choices[0]?.message?.content
}
```

**Groq Pricing (as of 2024):**
- Llama 3.1 70B: ~$0.59 per 1M tokens
- Llama 3.1 8B: ~$0.05 per 1M tokens
- **~10x cheaper than GPT-4o!**

### 2. Local Development with Ollama

For development, run models locally (completely free):

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download models
ollama pull llama3.1:8b
ollama pull codellama:7b
```

```typescript
// lib/ollama-client.ts (development only)
export async function generateWithOllama(prompt: string) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Ollama only available in development')
  }
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b',
      prompt: prompt,
      stream: false
    })
  })
  
  const result = await response.json()
  return result.response
}
```

### 3. Claude 3.5 Haiku (Anthropic)

Often cheaper than OpenAI with excellent quality:

```bash
npm install @anthropic-ai/sdk
```

```typescript
// lib/claude-client.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateWithClaude(prompt: string) {
  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }]
  })
  
  return message.content[0].text
}
```

## 📊 Cost Monitoring & Alerts

### 1. OpenAI Usage Tracking

```typescript
// lib/usage-tracking.ts
import { createClient } from '@/lib/supabase/server'

export async function trackAIUsage(
  userId: string, 
  provider: 'openai' | 'groq' | 'anthropic',
  model: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
) {
  const supabase = await createClient()
  
  await supabase.from('ai_usage').insert({
    user_id: userId,
    provider,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost: cost,
    created_at: new Date().toISOString()
  })
}

export async function getUserMonthlyCost(userId: string): Promise<number> {
  const supabase = await createClient()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { data } = await supabase
    .from('ai_usage')
    .select('estimated_cost')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())
  
  return data?.reduce((sum, record) => sum + record.estimated_cost, 0) || 0
}
```

### 2. Create Usage Dashboard

```typescript
// components/usage-dashboard.tsx
import { useEffect, useState } from 'react'
import { getUserMonthlyCost } from '@/lib/usage-tracking'

export function UsageDashboard({ userId }: { userId: string }) {
  const [monthlyCost, setMonthlyCost] = useState(0)
  
  useEffect(() => {
    getUserMonthlyCost(userId).then(setMonthlyCost)
  }, [userId])
  
  const costColor = monthlyCost > 10 ? 'text-red-500' : 
                   monthlyCost > 5 ? 'text-yellow-500' : 'text-green-500'
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">AI Usage This Month</h3>
      <p className={`text-2xl font-bold ${costColor}`}>
        ${monthlyCost.toFixed(2)}
      </p>
      <p className="text-sm text-muted-foreground">
        Budget: $10.00/month
      </p>
    </div>
  )
}
```

### 3. Implement Spending Caps

```typescript
// lib/spending-limits.ts
const MONTHLY_LIMIT = 10.00 // $10/month

export async function checkSpendingLimit(userId: string): Promise<boolean> {
  const monthlyCost = await getUserMonthlyCost(userId)
  return monthlyCost < MONTHLY_LIMIT
}

// In API routes:
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!await checkSpendingLimit(user.id)) {
    return NextResponse.json(
      { error: 'Monthly spending limit reached. Please try again next month.' },
      { status: 429 }
    )
  }
  
  // Continue with AI request...
}
```

## 🎯 Freemium Business Model

Implement usage limits to control costs:

```typescript
// lib/user-limits.ts
export const USER_LIMITS = {
  free: {
    backlogs: 2,
    chatMessages: 50, // per month
    storiesGenerated: 20, // per month
    aiProvider: 'gpt-4o-mini' // Cheaper model
  },
  pro: {
    backlogs: Infinity,
    chatMessages: Infinity,
    storiesGenerated: Infinity,
    aiProvider: 'gpt-4o' // Premium model
  }
}

export async function checkUserLimits(
  userId: string, 
  action: 'backlog' | 'chat' | 'generate'
): Promise<{ allowed: boolean, remaining: number }> {
  const supabase = await createClient()
  
  // Get user subscription status
  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single()
  
  const tier = user?.subscription_tier || 'free'
  const limits = USER_LIMITS[tier]
  
  // Check specific limit based on action
  // Implementation details...
  
  return { allowed: true, remaining: 10 }
}
```

## 📈 Monetization Strategies

### 1. Freemium Model

**Free Tier:**
- 2 backlogs
- 50 AI chat messages/month
- 20 story generations/month
- GPT-4o-mini model
- Community support

**Pro Tier ($9/month):**
- Unlimited backlogs
- Unlimited AI interactions
- GPT-4o model access
- Export features
- Priority support
- Custom templates

### 2. One-Time Purchase

**Lifetime Access ($49):**
- All Pro features
- Future updates included
- No monthly fees
- Perfect for solo entrepreneurs

### 3. GitHub Sponsors

- **$5/month**: Early access to features
- **$25/month**: Feature requests
- **$100/month**: Priority support + consultation

### 4. White-Label Licensing

License the codebase to companies for $299-999 one-time fee.

## 🚀 Production Deployment Strategy

### Phased Rollout

1. **Phase 1 (Free)**: Deploy with free tiers, monitor usage
2. **Phase 2 (Optimized)**: Implement caching, rate limiting
3. **Phase 3 (Monetized)**: Add Pro features, payment processing

### Monitoring Setup

```typescript
// lib/monitoring.ts
export async function logCostEvent(
  event: 'api_call' | 'ai_request' | 'database_query',
  cost: number,
  metadata: any
) {
  console.log(`[COST] ${event}: $${cost.toFixed(4)}`, metadata)
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Integrate with Mixpanel, PostHog, etc.
  }
}
```

## 💡 Additional Cost-Saving Tips

### 1. Database Optimization

```sql
-- Add efficient indexes
CREATE INDEX CONCURRENTLY idx_user_stories_backlog_status 
ON user_stories(backlog_id, status);

-- Archive old data
DELETE FROM chat_messages 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### 2. Image Optimization

```typescript
// Use Next.js Image component for automatic optimization
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
/>
```

### 3. Bundle Optimization

```javascript
// next.config.ts
export default {
  experimental: {
    bundlePagesRouterDependencies: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}
```

## 📋 Cost Checklist

- [ ] Switch to GPT-4o-mini for 90% cost reduction
- [ ] Implement response caching with Redis
- [ ] Add rate limiting to prevent abuse
- [ ] Set OpenAI spending limits ($10/month)
- [ ] Monitor usage with tracking dashboard
- [ ] Consider alternative AI providers (Groq, Claude)
- [ ] Implement freemium user limits
- [ ] Optimize database queries and indexes
- [ ] Use Next.js Image optimization
- [ ] Set up production monitoring
- [ ] Plan monetization strategy

With these optimizations, you can run AI Product Backlog for **under $10/month** while serving hundreds of users. The key is smart resource management and gradual scaling as your user base grows. 