import { ProfileIngressoLoader } from '@/components/profile/wrappers/profile-ingresso/profile-ingresso-loader'

interface IngressoDetalhePageProps {
  params: Promise<{ id: string }>
}

export default async function IngressoDetalhePage({
  params,
}: IngressoDetalhePageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen w-full bg-card-surface">
      <ProfileIngressoLoader id={id} />
    </div>
  )
}
