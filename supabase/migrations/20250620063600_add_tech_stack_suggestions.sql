-- Create table for storing tech stack suggestions
create table if not exists public.tech_stack_suggestions (
  id uuid default gen_random_uuid() primary key,
  backlog_id uuid references public.backlogs(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  project_type text not null,
  complexity text not null check (complexity in ('simple', 'moderate', 'complex')),
  estimated_timeframe text not null,
  key_features jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index tech_stack_suggestions_backlog_id_idx on public.tech_stack_suggestions(backlog_id);
create index tech_stack_suggestions_user_id_idx on public.tech_stack_suggestions(user_id);
create index tech_stack_suggestions_created_at_idx on public.tech_stack_suggestions(created_at desc);

-- Enable Row Level Security
alter table public.tech_stack_suggestions enable row level security;

-- Create RLS policies
create policy "Users can view own tech stack suggestions" on public.tech_stack_suggestions
  for select using (auth.uid() = user_id);

create policy "Users can insert own tech stack suggestions" on public.tech_stack_suggestions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tech stack suggestions" on public.tech_stack_suggestions
  for update using (auth.uid() = user_id);

create policy "Users can delete own tech stack suggestions" on public.tech_stack_suggestions
  for delete using (auth.uid() = user_id);

-- Create trigger for updated_at
create trigger handle_updated_at before update on public.tech_stack_suggestions
  for each row execute procedure public.handle_updated_at(); 