'use client'

import type { Curso } from '@/services/api/types'
import { useCurso } from '@/services/api/use-curso'
import { ProfileLoader } from '../../profile-loader'
import { ProfileIngresso } from './profile-ingresso'

interface ProfileIngressoLoaderProps {
  id: string
  initialData?: Curso
}

export const ProfileIngressoLoader = ({
  id,
  initialData,
}: ProfileIngressoLoaderProps) => {
  const { curso, isLoading, error, notFound } = useCurso(id, initialData)

  return (
    <ProfileLoader
      data={curso}
      isLoading={isLoading}
      error={error}
      notFound={notFound}
      notFoundTitle="Oferta não encontrada"
      notFoundDescription="O endereço aponta para uma oferta que não existe nesta edição dos dados. O link pode estar desatualizado ou incompleto."
      fallbackError="Não foi possível carregar esta oferta. Pode ser uma instabilidade temporária. Tente novamente em alguns instantes."
      backHref="/cursos"
    >
      {(data) => <ProfileIngresso curso={data} />}
    </ProfileLoader>
  )
}
