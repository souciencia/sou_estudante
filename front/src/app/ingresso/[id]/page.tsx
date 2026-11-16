import type { Metadata } from 'next'
import { ProfileIngressoLoader } from '@/components/profile/wrappers/profile-ingresso/profile-ingresso-loader'
import { API_CONFIG } from '@/services/api'
import { serverFetch } from '@/services/api/server'
import type { Curso } from '@/services/api/types'

interface IngressoDetalhePageProps {
  params: Promise<{ id: string }>
}

async function getCurso(id: string): Promise<Curso | undefined> {
  const result = await serverFetch<Curso>(API_CONFIG.ENDPOINTS.DETAIL_CURSO(id))
  return result.success ? result.data : undefined
}

export async function generateMetadata({
  params,
}: IngressoDetalhePageProps): Promise<Metadata> {
  const { id } = await params
  const curso = await getCurso(id)
  const nome = curso?.curso?.no_curso

  if (!nome) {
    return { title: 'Ingresso não encontrado | SoU_Estudante' }
  }

  const instituicao = curso?.instituicao?.no_ies
  return {
    title: `Ingresso — ${nome}${instituicao ? ` — ${instituicao}` : ''} | SoU_Estudante`,
    description: `Formas de ingresso do curso ${nome}.`,
  }
}

export default async function IngressoDetalhePage({
  params,
}: IngressoDetalhePageProps) {
  const { id } = await params
  const curso = await getCurso(id)

  return (
    <div className="min-h-screen w-full">
      <ProfileIngressoLoader id={id} initialData={curso} />
    </div>
  )
}
