# 🚀 Deployment Guide

## Quick Deploy (5 minutes)

### 1. One-Click Vercel Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-backlog)

### 2. Manual Setup

**Fork & Clone:**
```bash
git clone https://github.com/yourusername/ai-backlog.git
cd ai-backlog
npm install
```

**Environment Variables:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Step-by-Step Production Setup

### 1. Supabase Setup

1. **Create Project**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Run SQL Migration**: Copy from [Database Setup](#database-migration)
3. **Configure Auth**: 
   - Enable GitHub provider
   - Set site URL: `https://your-domain.vercel.app`
   - Add redirect URLs

### 2. GitHub OAuth Setup

1. **GitHub Settings** → Developer settings → OAuth Apps
2. **Create OAuth App**:
   - Application name: `AI Product Backlog`
   - Homepage URL: `https://your-domain.vercel.app`
   - Authorization callback: `https://your-domain.vercel.app/auth/callback`
3. **Add to Supabase**: Authentication → Providers → GitHub

### 3. OpenAI Setup

1. **Get API Key**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Set Usage Limits**: $10-20/month recommended
3. **Enable Usage Alerts**: 50% and 80% thresholds

### 4. Vercel Deployment

```bash
# Connect to Vercel
npm i -g vercel
vercel login
vercel --prod
```

**Environment Variables in Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Database Migration

```sql
-- Run this in Supabase SQL Editor

-- Create backlogs table
create table public.backlogs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user stories table
create type story_status as enum ('backlog', 'in_progress', 'done');

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

-- Create indexes
create index backlogs_user_id_idx on public.backlogs(user_id);
create index user_stories_backlog_id_idx on public.user_stories(backlog_id);
create index chat_messages_backlog_id_idx on public.chat_messages(backlog_id);

-- Enable RLS
alter table public.backlogs enable row level security;
alter table public.user_stories enable row level security;
alter table public.chat_messages enable row level security;

-- Create policies
create policy "Users can manage own backlogs" on public.backlogs
  using (auth.uid() = user_id);

create policy "Users can manage own stories" on public.user_stories
  using (auth.uid() = user_id);

create policy "Users can manage own messages" on public.chat_messages
  using (auth.uid() = user_id);
```

## Cost-Optimized Deployment

### Free Tier Configuration

**Switch to GPT-4o-mini** (90% cost reduction):

```typescript
// app/api/chat/route.ts
const result = await streamText({
  model: openai('gpt-4o-mini'), // Instead of 'gpt-4o'
  messages: conversationMessages,
  temperature: 0.7,
  maxTokens: 800,
})
```

### Monitoring Setup

**Add usage tracking**:

```typescript
// lib/usage-tracker.ts
export async function trackUsage(userId: string, cost: number) {
  console.log(`User ${userId}: $${cost.toFixed(4)}`)
  // Send to monitoring service
}
```

## Alternative Deployment Options

### 1. Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway deploy
```

### 2. Digital Ocean App Platform
```yaml
# .do/app.yaml
name: ai-backlog
services:
- name: web
  source_dir: /
  github:
    repo: yourusername/ai-backlog
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

### 3. Self-Hosted (VPS)
```bash
# Docker deployment
docker build -t ai-backlog .
docker run -p 3000:3000 -d ai-backlog
```

## Production Checklist

- [ ] Database migration completed
- [ ] GitHub OAuth configured
- [ ] OpenAI API key set with limits
- [ ] Environment variables configured
- [ ] Domain name connected
- [ ] SSL certificate active
- [ ] Analytics tracking setup
- [ ] Error monitoring enabled
- [ ] Backup strategy implemented
- [ ] Cost alerts configured

## Monitoring & Maintenance

### Essential Monitoring
1. **Vercel Analytics**: Performance metrics
2. **Supabase Logs**: Database queries
3. **OpenAI Usage**: API costs
4. **Uptime Monitoring**: Service availability

### Regular Maintenance
- **Weekly**: Check usage metrics
- **Monthly**: Review costs and optimization
- **Quarterly**: Update dependencies
- **Annually**: Security audit

Your AI Product Backlog will be live and cost-optimized! 🎉 