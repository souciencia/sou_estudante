import type { Metadata } from 'next'
import { ProfileCursosLoader } from '@/components/profile/wrappers/profile-cursos/profile-cursos-loader'
import { API_CONFIG } from '@/services/api'
import { serverFetch } from '@/services/api/server'
import type { Curso } from '@/services/api/types'

interface CursoDetalhePageProps {
  params: Promise<{ id: string }>
}

async function getCurso(id: string): Promise<Curso | undefined> {
  const result = await serverFetch<Curso>(API_CONFIG.ENDPOINTS.DETAIL_CURSO(id))
  return result.success ? result.data : undefined
}

export async function generateMetadata({
  params,
}: CursoDetalhePageProps): Promise<Metadata> {
  const { id } = await params
  const curso = await getCurso(id)
  const nome = curso?.curso?.no_curso

  if (!nome) {
    return { title: 'Curso não encontrado | SoU_Estudante' }
  }

  const instituicao = curso?.instituicao?.no_ies
  return {
    title: `${nome}${instituicao ? ` — ${instituicao}` : ''} | SoU_Estudante`,
    description:
      curso?.curso?.cine?.no_cine_area_geral ??
      `Dados do curso ${nome} no ensino superior.`,
  }
}

export default async function CursoDetalhePage({
  params,
}: CursoDetalhePageProps) {
  const { id } = await params
  const curso = await getCurso(id)

  return (
    <div className="min-h-screen w-full">
      <ProfileCursosLoader id={id} initialData={curso} />
    </div>
  )
}
