import BacklogOverview from '@/components/backlog-overview'

interface BacklogPageProps {
  params: Promise<{ id: string }>
}

export default async function BacklogPage({ params }: BacklogPageProps) {
  const { id } = await params

  return <BacklogOverview backlogId={id} />
} 