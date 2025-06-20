-- AI Product Backlog Database Setup
-- Run this in your Supabase SQL Editor

-- Create enum for story status (optional for future kanban)
create type story_status as enum ('backlog', 'in_progress', 'done');

-- Create backlogs table
create table public.backlogs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat messages table for backlog conversations
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  backlog_id uuid references public.backlogs(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user stories table
create table public.user_stories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  backlog_id uuid references public.backlogs(id) on delete cascade,
  title text not null,
  description text not null,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  status story_status default 'backlog',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index backlogs_user_id_idx on public.backlogs(user_id);
create index backlogs_created_at_idx on public.backlogs(created_at desc);

create index chat_messages_backlog_id_idx on public.chat_messages(backlog_id);
create index chat_messages_created_at_idx on public.chat_messages(created_at asc);

create index user_stories_user_id_idx on public.user_stories(user_id);
create index user_stories_backlog_id_idx on public.user_stories(backlog_id);
create index user_stories_created_at_idx on public.user_stories(created_at desc);

-- Enable RLS (Row Level Security)
alter table public.backlogs enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_stories enable row level security;

-- Create policies for backlogs
create policy "Users can view own backlogs" on public.backlogs
  for select using (auth.uid() = user_id);

create policy "Users can insert own backlogs" on public.backlogs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own backlogs" on public.backlogs
  for update using (auth.uid() = user_id);

create policy "Users can delete own backlogs" on public.backlogs
  for delete using (auth.uid() = user_id);

-- Create policies for chat messages
create policy "Users can view own chat messages" on public.chat_messages
  for select using (auth.uid() = user_id);

create policy "Users can insert own chat messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

create policy "Users can update own chat messages" on public.chat_messages
  for update using (auth.uid() = user_id);

create policy "Users can delete own chat messages" on public.chat_messages
  for delete using (auth.uid() = user_id);

-- Create policies for user stories
create policy "Users can view own stories" on public.user_stories
  for select using (auth.uid() = user_id);

create policy "Users can insert own stories" on public.user_stories
  for insert with check (auth.uid() = user_id);

create policy "Users can update own stories" on public.user_stories
  for update using (auth.uid() = user_id);

create policy "Users can delete own stories" on public.user_stories
  for delete using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_backlogs_updated_at
  before update on public.backlogs
  for each row
  execute function public.handle_updated_at();

create trigger handle_user_stories_updated_at
  before update on public.user_stories
  for each row
  execute function public.handle_updated_at();

-- Migration: Create default backlog for existing users with stories
DO $$
DECLARE
  user_record RECORD;
  default_backlog_id UUID;
BEGIN
  -- For each user who has existing stories without a backlog
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM public.user_stories 
    WHERE backlog_id IS NULL
  LOOP
    -- Create a default backlog for this user
    INSERT INTO public.backlogs (user_id, name, description)
    VALUES (
      user_record.user_id, 
      'Default Backlog', 
      'Your original backlog - automatically created during migration'
    )
    RETURNING id INTO default_backlog_id;
    
    -- Update all stories for this user to belong to the default backlog
    UPDATE public.user_stories 
    SET backlog_id = default_backlog_id 
    WHERE user_id = user_record.user_id AND backlog_id IS NULL;
  END LOOP;
END $$;

-- View the table structures
\d backlogs;
\d chat_messages;
\d user_stories; 