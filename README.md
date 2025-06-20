<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>

# 🧠 AI Product Backlog

> **Transform your product ideas into well-structured user stories using AI-powered conversations**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-backlog)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blue)](https://openai.com/)

## 🎯 Overview

AI Product Backlog is a modern web application that revolutionizes product management by combining AI-powered conversations with traditional backlog management. Create multiple product backlogs, chat with AI about your ideas, and generate contextual user stories that understand your product's history and requirements.

### ✨ Key Features

- 🤖 **Contextual AI Chat** - Discuss product ideas with AI that remembers your conversation history
- ⚡ **Smart Story Generation** - Generate user stories from chat conversations with proper format and acceptance criteria
- 📋 **Multi-Backlog Management** - Create and manage multiple product backlogs
- 📊 **Visual Kanban Boards** - Track progress with drag-and-drop kanban functionality
- 🛠️ **Tech Stack Suggestions** - AI-powered technology recommendations based on your user stories
- 🔐 **Secure Authentication** - GitHub OAuth integration with Supabase Auth
- 💾 **Persistent Storage** - All conversations and stories saved to PostgreSQL
- 📱 **Responsive Design** - Beautiful, mobile-friendly interface
- 🌓 **Dark/Light Mode** - System-aware theme switching
- ⚡ **Real-time Streaming** - Watch AI responses generate in real-time

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- An OpenAI API key
- GitHub account (for OAuth)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/ai-backlog.git
cd ai-backlog
npm install
```

### 2. Environment Setup

Create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Migration

Run the SQL migrations in your Supabase dashboard (see [Database Setup](#database-setup) below).

### 4. GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App:
   - **Application name**: AI Product Backlog
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
3. Add the OAuth credentials to your Supabase project:
   - Go to Authentication → Providers → GitHub
   - Enable GitHub provider
   - Add your Client ID and Client Secret

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components, Lucide icons
- **Backend**: Next.js API routes, Edge Runtime
- **Database**: Supabase (PostgreSQL), Row Level Security (RLS)
- **Authentication**: Supabase Auth with GitHub OAuth
- **AI Integration**: Vercel AI SDK with OpenAI GPT-4o
- **State Management**: React hooks, SWR for data fetching
- **Deployment**: Vercel, serverless functions

### Database Schema

```sql
-- Backlogs table
backlogs (
  id: uuid (primary key),
  user_id: uuid (foreign key to auth.users),
  name: text,
  description: text,
  created_at: timestamp,
  updated_at: timestamp
)

-- User Stories table
user_stories (
  id: uuid (primary key),
  backlog_id: uuid (foreign key to backlogs),
  user_id: uuid (foreign key to auth.users),
  title: text,
  description: text,
  acceptance_criteria: jsonb,
  status: enum ('backlog', 'in_progress', 'done'),
  created_at: timestamp,
  updated_at: timestamp
)

-- Chat Messages table
chat_messages (
  id: uuid (primary key),
  backlog_id: uuid (foreign key to backlogs),
  user_id: uuid (foreign key to auth.users),
  role: text ('user' | 'assistant'),
  content: text,
  metadata: jsonb,
  created_at: timestamp
)
```

## 📖 Features Deep Dive

### 🤖 AI Chat Interface

The chat interface provides a conversational way to explore product ideas:

- **Context Awareness**: AI remembers the entire conversation history for each backlog
- **Backlog Context**: AI understands existing user stories and backlog description
- **Smart Responses**: Asks clarifying questions and provides product management insights
- **Real-time Streaming**: Responses appear as they're generated
- **Message Persistence**: All conversations are saved to the database

**Example Conversation:**
```
User: I want to build a task management app for teams
AI: That's a great idea! Let me ask a few questions to better understand your vision:

1. What size teams are you targeting? (2-5 people, 10-50, enterprise?)
2. What's the main pain point you're solving that existing tools don't address?
3. Are you thinking more kanban-style, list-based, or calendar-focused?

User: Small teams of 3-8 people. The main issue is that tools like Asana are too complex
AI: Perfect! Simplicity for small teams is a great niche. So you're thinking of something that:
- Has the power they need but isn't overwhelming
- Quick to set up and start using
- Maybe focuses on the core workflow without enterprise bells and whistles?

What specific features would you consider "must-have" vs "nice-to-have"?
```

### ⚡ Smart Story Generation

Generate user stories directly from your conversations:

- **Context-Driven**: Stories are generated based on the specific conversation context
- **Proper Format**: Follows "As a [user], I want [goal] so that [benefit]" format
- **Detailed Acceptance Criteria**: Each story includes 2-4 specific, testable criteria
- **Avoids Duplication**: AI checks existing stories to prevent duplicates
- **Priority Ordering**: Stories are generated in order of importance

**Example Generated Stories:**
```
Title: As a team leader, I want to create projects quickly so that my team can start working without delays

Description: Team leaders need a streamlined way to set up new projects without going through complex configuration processes.

Acceptance Criteria:
• Can create a project with just a name and description
• Pre-configured with sensible defaults (standard columns, basic workflow)
• Takes less than 2 minutes from creation to team members being able to add tasks
• Includes option to use templates for common project types
```

### 📊 Kanban Board

Visual task management with drag-and-drop functionality:

- **Three-Column Layout**: Backlog → In Progress → Done
- **Drag & Drop**: Move stories between columns to update status
- **Real-time Updates**: Changes are immediately saved to the database
- **Story Details**: Click to view full story details and acceptance criteria
- **Progress Tracking**: Visual indicators of backlog completion

### 🛠️ Tech Stack Suggestions

Get AI-powered technology recommendations tailored to your project:

- **Intelligent Analysis**: Analyzes your user stories, project description, and requirements
- **Comprehensive Coverage**: Suggests frontend, backend, database, hosting, and specialized tools
- **Detailed Reasoning**: Explains why each technology is recommended for your specific use case
- **Difficulty Assessment**: Each suggestion includes difficulty level (beginner/intermediate/advanced)
- **Alternative Options**: Provides alternative technologies for each category
- **Project Analysis**: Assesses overall project complexity and estimated development timeframe

**Technology Categories Covered:**
- **Frontend**: React, Vue, Angular, Svelte, Next.js, Nuxt.js
- **Backend**: Node.js, Python (Django/FastAPI), Ruby on Rails, Go, Java Spring
- **Database**: PostgreSQL, MongoDB, Redis, Firebase, Supabase
- **Hosting**: Vercel, Netlify, AWS, Google Cloud, Railway
- **Mobile**: React Native, Flutter, Swift, Kotlin
- **AI/ML**: OpenAI, Google AI, TensorFlow, PyTorch
- **Authentication**: Auth0, Firebase Auth, Supabase Auth, NextAuth.js
- **Payments**: Stripe, PayPal, Square
- **Analytics**: Google Analytics, Mixpanel, PostHog
- **Monitoring**: Sentry, LogRocket, DataDog

**Example Tech Stack Analysis:**
```
Project Type: Team Task Management SaaS
Complexity: Moderate
Estimated Timeframe: 3-6 months

✅ Frontend: Next.js (Intermediate)
   Perfect for SaaS with built-in SSR, API routes, and excellent DX
   Alternatives: React + Vite, Remix

✅ Database: PostgreSQL (Beginner)
   Excellent for relational data, strong consistency, ACID compliance
   Alternatives: MongoDB, Firebase Firestore

✅ Authentication: Supabase Auth (Beginner)
   Secure auth with social logins, perfect for team-based apps
   Alternatives: Auth0, Firebase Auth
```

### 🔐 Authentication & Security

- **GitHub OAuth**: Secure authentication without managing passwords
- **Row Level Security**: Database-level security ensuring users only see their data
- **Server-side Auth**: Authentication handled on the server for security
- **Session Management**: Persistent sessions with automatic refresh

## 💰 Cost Optimization Guide

### Free Tier Limits

**Vercel (Free Plan)**
- ✅ 100GB bandwidth/month
- ✅ Unlimited personal repositories
- ✅ Automatic deployments
- ✅ Edge functions (10 second max duration)

**Supabase (Free Plan)**
- ✅ Up to 50,000 monthly active users
- ✅ 500MB database storage
- ✅ 50MB file storage
- ✅ Up to 500,000 Edge Function invocations/month
- ⚠️ 2 projects maximum

**OpenAI Costs**
- GPT-4o: ~$0.0025 per 1K input tokens, ~$0.01 per 1K output tokens
- GPT-4o-mini: ~$0.00015 per 1K input tokens, ~$0.0006 per 1K output tokens

### Cost Reduction Strategies

#### 1. Switch to GPT-4o-mini

Update `app/api/chat/route.ts` and `app/api/generate-stories/route.ts`:

```typescript
// Change from:
model: openai('gpt-4o')
// To:
model: openai('gpt-4o-mini')

// This reduces costs by ~90% with minimal quality loss for most use cases
```

#### 2. Implement Request Caching

```typescript
// Add to your API routes
const cacheKey = `story-generation-${hashString(prompt)}`
const cached = await redis.get(cacheKey)
if (cached) return cached

// Generate response
const response = await generateStory(prompt)
await redis.setex(cacheKey, 3600, response) // Cache for 1 hour
```

#### 3. Add Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
})
```

#### 4. Set OpenAI Spending Limits

1. Go to [OpenAI Usage Dashboard](https://platform.openai.com/usage)
2. Set monthly spending limits (e.g., $5-10/month)
3. Configure usage alerts

### Alternative AI Providers

#### Groq (Much Cheaper & Faster)

```bash
npm install groq-sdk
```

```typescript
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Use Llama 3.1 or Mixtral models
const response = await groq.chat.completions.create({
  messages: messages,
  model: "llama-3.1-70b-versatile", // Much cheaper than GPT-4
})
```

#### Local Development with Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Run locally (free)
ollama run llama3.1
```

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables

3. **Environment Variables in Vercel**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Update GitHub OAuth**:
   - Update callback URL to `https://yourdomain.vercel.app/auth/callback`
   - Update Supabase Auth settings with production URLs

### Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create backlogs table
create table public.backlogs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create enum for story status
create type story_status as enum ('backlog', 'in_progress', 'done');

-- Create user stories table
create table public.user_stories (
  id uuid default gen_random_uuid() primary key,
  backlog_id uuid references public.backlogs(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  description text not null,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  status story_status default 'backlog',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat messages table
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  backlog_id uuid references public.backlogs(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index backlogs_user_id_idx on public.backlogs(user_id);
create index backlogs_created_at_idx on public.backlogs(created_at desc);
create index user_stories_backlog_id_idx on public.user_stories(backlog_id);
create index user_stories_user_id_idx on public.user_stories(user_id);
create index user_stories_created_at_idx on public.user_stories(created_at desc);
create index chat_messages_backlog_id_idx on public.chat_messages(backlog_id);
create index chat_messages_created_at_idx on public.chat_messages(created_at asc);

-- Enable Row Level Security
alter table public.backlogs enable row level security;
alter table public.user_stories enable row level security;
alter table public.chat_messages enable row level security;

-- Create RLS policies for backlogs
create policy "Users can view own backlogs" on public.backlogs
  for select using (auth.uid() = user_id);
create policy "Users can insert own backlogs" on public.backlogs
  for insert with check (auth.uid() = user_id);
create policy "Users can update own backlogs" on public.backlogs
  for update using (auth.uid() = user_id);
create policy "Users can delete own backlogs" on public.backlogs
  for delete using (auth.uid() = user_id);

-- Create RLS policies for user stories
create policy "Users can view own stories" on public.user_stories
  for select using (auth.uid() = user_id);
create policy "Users can insert own stories" on public.user_stories
  for insert with check (auth.uid() = user_id);
create policy "Users can update own stories" on public.user_stories
  for update using (auth.uid() = user_id);
create policy "Users can delete own stories" on public.user_stories
  for delete using (auth.uid() = user_id);

-- Create RLS policies for chat messages
create policy "Users can view own chat messages" on public.chat_messages
  for select using (auth.uid() = user_id);
create policy "Users can insert own chat messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);
create policy "Users can update own chat messages" on public.chat_messages
  for update using (auth.uid() = user_id);
create policy "Users can delete own chat messages" on public.chat_messages
  for delete using (auth.uid() = user_id);
```

## 💼 Monetization Strategies

### 1. Freemium Model

**Free Tier:**
- 2 backlogs maximum
- 10 AI conversations per month
- Basic kanban board

**Pro Tier ($9/month):**
- Unlimited backlogs
- Unlimited AI conversations
- Advanced features (templates, export, etc.)
- Priority support

### 2. One-Time Purchase

**Lifetime Access ($49):**
- All features unlocked
- Future updates included
- One-time payment, no subscriptions

### 3. GitHub Sponsors

- Accept donations for feature development
- Sponsor tiers with perks (early access, feature requests)
- Transparent development process

### 4. White-Label Solution

- License the codebase to companies
- Custom branding and deployment
- Enterprise support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Submit a Pull Request

### Local Development

```bash
# Install dependencies
npm install

# Start Supabase (if using local development)
npx supabase start

# Run development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📚 API Documentation

### Endpoints

- `POST /api/chat` - AI chat conversation
- `POST /api/generate-stories` - Generate user stories from prompt
- `POST /api/generate-stories-from-chat` - Generate stories from chat context
- `GET /auth/callback` - OAuth callback handler

For detailed API documentation, see [docs/API.md](./docs/API.md).

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ | - |
| `OPENAI_API_KEY` | OpenAI API key | ✅ | - |
| `GROQ_API_KEY` | Groq API key (optional) | ❌ | - |

### Feature Flags

Update `lib/config.ts` to enable/disable features:

```typescript
export const config = {
  features: {
    aiChat: true,
    kanbanBoard: true,
    storyGeneration: true,
    exportFeatures: false, // Pro feature
  },
  limits: {
    freeBacklogs: 2,
    freeChatMessages: 10,
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**1. Authentication not working**
- Check GitHub OAuth configuration
- Verify callback URLs match exactly
- Ensure Supabase Auth is properly configured

**2. AI responses not generating**
- Verify OpenAI API key is valid
- Check API key permissions and billing
- Look at browser console for errors

**3. Database connection issues**
- Verify Supabase URL and anon key
- Check if RLS policies are properly set up
- Ensure tables exist (run migrations)

**4. Stories not saving**
- Check authentication status
- Verify RLS policies allow the operation
- Look at server logs for errors

For more help, see [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel](https://vercel.com/) for the hosting platform
- [Supabase](https://supabase.com/) for the backend infrastructure
- [OpenAI](https://openai.com/) for the AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the styling system

## 📞 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ai-backlog/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/ai-backlog/discussions)
- 📖 Documentation: [docs/](./docs/)

---

<p align="center">
  <strong>Built with ❤️ for product managers worldwide</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features-deep-dive">Features</a> •
  <a href="#-cost-optimization-guide">Cost Guide</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-monetization-strategies">Monetization</a>
</p>
