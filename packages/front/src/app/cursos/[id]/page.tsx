import { ProfileCursosLoader } from '@/components/profile/wrappers/profile-cursos/profile-cursos-loader'

interface CursoDetalhePageProps {
  params: Promise<{ id: string }>
}

export default async function CursoDetalhePage({
  params,
}: CursoDetalhePageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen w-full bg-card-surface">
      <ProfileCursosLoader id={id} />
    </div>
  )
}
