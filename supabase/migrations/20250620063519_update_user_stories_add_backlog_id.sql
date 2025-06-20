-- Add backlog_id column to user_stories table
alter table public.user_stories 
add column backlog_id uuid references public.backlogs(id) on delete cascade;

-- Create index for the new backlog_id column
create index user_stories_backlog_id_idx on public.user_stories(backlog_id);

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
