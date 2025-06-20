-- Create task_status enum
create type task_status as enum ('todo', 'in_progress', 'done');

-- Create task_priority enum
create type task_priority as enum ('low', 'medium', 'high', 'critical');

-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_story_id uuid references public.user_stories(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  description text not null,
  status task_status default 'todo',
  priority task_priority default 'medium',
  estimated_hours numeric(4,1) default null,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index tasks_user_story_id_idx on public.tasks(user_story_id);
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_created_at_idx on public.tasks(created_at desc);
create index tasks_status_idx on public.tasks(status);
create index tasks_order_idx on public.tasks(order_index);

-- Enable RLS (Row Level Security)
alter table public.tasks enable row level security;

-- Create policies for tasks
create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- Create updated_at trigger for tasks
create trigger handle_tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at(); 