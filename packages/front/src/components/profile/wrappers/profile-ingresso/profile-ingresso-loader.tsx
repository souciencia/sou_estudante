'use client'

import { useRouter } from 'next/navigation'
import { useCurso } from '@/services/api/use-curso'
import ProfileSkeleton, { ProfileSkeletonCard } from '../../profile-skeleton'
import { ProfileIngresso } from './profile-ingresso'

interface ProfileIngressoLoaderProps {
  id: string
}

export const ProfileIngressoLoader = ({ id }: ProfileIngressoLoaderProps) => {
  const { curso, isLoading, error, notFound } = useCurso(id)
  const router = useRouter()
  const temSisu = curso?.sisu.tem_sisu

  if (isLoading) {
    return (
      <div aria-busy="true">
        <ProfileSkeleton className="mb-2 h-3 w-28" />
        <ProfileSkeleton className="mb-1 h-6 w-3/4" />
        <ProfileSkeleton className="mb-5 h-4 w-1/2" />
        <ProfileSkeletonCard />
      </div>
    )
  }

  if (notFound) {
    return (
      <div
        role="alert"
        className="rounded-[14px] border border-plum-100 bg-surface p-4"
      >
        <div className="mb-1 text-sm font-bold text-text">
          Oferta não encontrada
        </div>
        <p className="text-xs leading-relaxed text-text-muted">
          O endereço aponta para uma oferta que não existe nesta edição dos
          dados — o link pode estar desatualizado ou incompleto. Nenhum dado foi
          omitido: esta combinação de curso, UF e área não está na base atual.
        </p>
        <button
          type="button"
          onClick={() => router.push('/ingressos')}
          className="mt-3 inline-flex cursor-pointer items-center rounded-[10px] bg-text px-4 py-2 text-[13px] font-semibold text-white transition-transform duration-fast ease-prow active:scale-[0.97]"
        >
          Ir para a lista de cursos
        </button>
      </div>
    )
  }

  if (error || !curso) {
    return (
      <div
        role="alert"
        className="rounded-[14px] border border-plum-100 bg-surface p-4"
      >
        <div className="mb-1 text-sm font-bold text-text">
          Não foi possível carregar esta oferta
        </div>
        <p className="text-xs leading-relaxed text-text-muted">
          Possível instabilidade de rede. Tente novamente mais tarde.
        </p>
        <button
          type="button"
          onClick={() => router.push('/ingressos')}
          className="mt-3 inline-flex cursor-pointer items-center rounded-[10px] bg-text px-4 py-2 text-[13px] font-semibold text-white transition-transform duration-fast ease-prow active:scale-[0.97]"
        >
          Ir para a lista de cursos
        </button>
      </div>
    )
  }

  if (!temSisu) {
    return (
      <div
        role="alert"
        className="rounded-[14px] border border-plum-100 bg-surface p-4"
      >
        <div className="mb-1 text-sm font-bold text-text">
          O curso não possui ingresso por Sisu
        </div>
        <p className="text-xs leading-relaxed text-text-muted">
          O endereço aponta para uma oferta que não possui ingresso por meio do
          Sisu.
        </p>
        <button
          type="button"
          onClick={() => router.push('/ingressos')}
          className="mt-3 inline-flex cursor-pointer items-center rounded-[10px] bg-text px-4 py-2 text-[13px] font-semibold text-white transition-transform duration-fast ease-prow active:scale-[0.97]"
        >
          Ir para a lista de cursos com ingresso por Sisu
        </button>
      </div>
    )
  }

  return <ProfileIngresso curso={curso} />
}
