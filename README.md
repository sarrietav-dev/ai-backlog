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

# AI Product Backlog

A modern web application that uses AI to generate user stories for product development. Built with Next.js, Supabase, and OpenAI.

## Features

- **AI-Powered Story Generation**: Describe your product idea and get comprehensive user stories powered by GPT-4
- **Real-time Streaming**: Watch stories generate in real-time with streaming responses
- **User Authentication**: Sign in with GitHub to save and manage your stories
- **Persistent Storage**: All stories are saved to Supabase with full CRUD operations
- **Sortable Table**: View and sort your saved stories by title, status, or creation date
- **Responsive Design**: Beautiful, mobile-friendly interface built with Tailwind CSS
- **Type Safety**: Full TypeScript support with Zod schema validation

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with GitHub OAuth
- **AI Integration**: Vercel AI SDK with OpenAI GPT-4
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- An OpenAI API key

### Environment Variables

Create a `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

1. Create a new Supabase project
2. Run the database migration to create the required tables:

```sql
-- Create enum for story status
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

-- Create indexes
create index user_stories_user_id_idx on public.user_stories(user_id);
create index user_stories_created_at_idx on public.user_stories(created_at desc);

-- Enable RLS
alter table public.user_stories enable row level security;

-- Create policies
create policy "Users can view own stories" on public.user_stories
  for select using (auth.uid() = user_id);

create policy "Users can insert own stories" on public.user_stories
  for insert with check (auth.uid() = user_id);

create policy "Users can update own stories" on public.user_stories
  for update using (auth.uid() = user_id);

create policy "Users can delete own stories" on public.user_stories
  for delete using (auth.uid() = user_id);
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-backlog.git
cd ai-backlog
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Generate Stories**: Enter a product description (e.g., "I want to build a web app for booking dog walking appointments")
2. **Watch AI Generate**: See stories appear in real-time with proper user story format and acceptance criteria
3. **Sign In** (optional): Authenticate with GitHub to save stories
4. **Save & Manage**: Save generated stories to your persistent backlog
5. **Sort & Filter**: View all your stories in a sortable table

## API Routes

- `POST /api/generate-stories` - Generate user stories from a prompt
- `POST /api/save-stories` - Save generated stories to the database
- `GET /auth/callback` - Handle OAuth authentication callbacks

## Example Output

Input: "I want to build a web app for booking dog walking appointments"

Generated Stories:
- As a dog owner, I want to view available time slots so that I can book a convenient appointment
- As a dog owner, I want to create a profile for my dog so that walkers know their specific needs
- As a dog walker, I want to set my availability so that owners can book appropriate times

Each story includes detailed acceptance criteria and implementation guidance.

## Deployment

This app is designed to deploy seamlessly on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you have questions or need help:
- Open an issue on GitHub
- Check the Supabase documentation
- Review the OpenAI API documentation

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
