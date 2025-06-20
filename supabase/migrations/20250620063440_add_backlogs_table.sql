-- Create backlogs table
create table public.backlogs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index backlogs_user_id_idx on public.backlogs(user_id);
create index backlogs_created_at_idx on public.backlogs(created_at desc);

-- Enable RLS (Row Level Security)
alter table public.backlogs enable row level security;

-- Create policies for backlogs
create policy "Users can view own backlogs" on public.backlogs
  for select using (auth.uid() = user_id);

create policy "Users can insert own backlogs" on public.backlogs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own backlogs" on public.backlogs
  for update using (auth.uid() = user_id);

create policy "Users can delete own backlogs" on public.backlogs
  for delete using (auth.uid() = user_id);

-- Create updated_at trigger for backlogs
create trigger handle_backlogs_updated_at
  before update on public.backlogs
  for each row
  execute function public.handle_updated_at();
