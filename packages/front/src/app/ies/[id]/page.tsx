import { ProfileIESLoader } from '@/components/profile-ies/profile-ies-loader'

interface IesDetalhePageProps {
  params: Promise<{ id: string }>
}

export default async function IesDetalhePage({ params }: IesDetalhePageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen w-full bg-card-surface">
      <ProfileIESLoader id={id} />
    </div>
  )
}
