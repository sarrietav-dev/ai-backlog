-- AI Product Backlog Database Setup
-- Run this in your Supabase SQL Editor

-- Create enum for story status (optional for future kanban)
create type story_status as enum ('backlog', 'in_progress', 'done');

-- Create user stories table
create table public.user_stories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text not null,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  status story_status default 'backlog',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for better query performance
create index user_stories_user_id_idx on public.user_stories(user_id);
create index user_stories_created_at_idx on public.user_stories(created_at desc);

-- Enable RLS (Row Level Security)
alter table public.user_stories enable row level security;

-- Create policies for RLS
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

create trigger handle_updated_at
  before update on public.user_stories
  for each row
  execute function public.handle_updated_at();

-- Optional: Insert some sample data (remove user_id or replace with actual user ID)
-- insert into public.user_stories (user_id, title, description, acceptance_criteria) values 
--   ('00000000-0000-0000-0000-000000000000', 
--    'As a user, I want to sign up so that I can save my stories', 
--    'Users should be able to create an account to persist their generated user stories.',
--    '["User can sign up with email", "User receives confirmation email", "User can log in after signup"]');

-- View the table structure
\d user_stories; 