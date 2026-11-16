import type { Metadata } from 'next'
import { ProfilePermanenciaLoader } from '@/components/profile/wrappers/profile-permanencia/profile-permanencia-loader'
import { API_CONFIG } from '@/services/api'
import { serverFetch } from '@/services/api/server'
import type { Curso } from '@/services/api/types'

interface PermanenciaDetalhePageProps {
  params: Promise<{ id: string }>
}

async function getCurso(id: string): Promise<Curso | undefined> {
  const result = await serverFetch<Curso>(API_CONFIG.ENDPOINTS.DETAIL_CURSO(id))
  return result.success ? result.data : undefined
}

export async function generateMetadata({
  params,
}: PermanenciaDetalhePageProps): Promise<Metadata> {
  const { id } = await params
  const curso = await getCurso(id)
  const nome = curso?.curso?.no_curso

  if (!nome) {
    return { title: 'Permanência não encontrada | SoU_Estudante' }
  }

  const instituicao = curso?.instituicao?.no_ies
  return {
    title: `Permanência — ${nome}${instituicao ? ` — ${instituicao}` : ''} | SoU_Estudante`,
    description: `Bolsas, cotas e apoios para permanecer no curso ${nome}.`,
  }
}

export default async function PermanenciaDetalhePage({
  params,
}: PermanenciaDetalhePageProps) {
  const { id } = await params
  const curso = await getCurso(id)

  return (
    <div className="min-h-screen w-full">
      <ProfilePermanenciaLoader id={id} initialData={curso} />
    </div>
  )
}
