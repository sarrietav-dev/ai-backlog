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

-- Create indexes for better query performance
create index chat_messages_backlog_id_idx on public.chat_messages(backlog_id);
create index chat_messages_created_at_idx on public.chat_messages(created_at asc);

-- Enable RLS (Row Level Security)
alter table public.chat_messages enable row level security;

-- Create policies for chat messages
create policy "Users can view own chat messages" on public.chat_messages
  for select using (auth.uid() = user_id);

create policy "Users can insert own chat messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

create policy "Users can update own chat messages" on public.chat_messages
  for update using (auth.uid() = user_id);

create policy "Users can delete own chat messages" on public.chat_messages
  for delete using (auth.uid() = user_id);
