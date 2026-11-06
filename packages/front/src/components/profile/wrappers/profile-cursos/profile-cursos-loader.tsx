'use client'

import type { Curso } from '@/services/api/types'
import { useCurso } from '@/services/api/use-curso'
import { ProfileLoader } from '../../profile-loader'
import { ProfileCursos } from './profile-cursos'

interface ProfileCursosLoaderProps {
  id: string
  initialData?: Curso
}

export const ProfileCursosLoader = ({
  id,
  initialData,
}: ProfileCursosLoaderProps) => {
  const { curso, isLoading, error, notFound } = useCurso(id, initialData)

  return (
    <ProfileLoader
      data={curso}
      isLoading={isLoading}
      error={error}
      notFound={notFound}
      notFoundTitle="Curso não encontrado"
      notFoundDescription="O curso que você procura não existe ou foi removido."
      fallbackError="Não foi possível carregar o curso. Pode ser uma instabilidade temporária. Tente novamente em alguns instantes."
      backHref="/cursos"
    >
      {(data) => <ProfileCursos curso={data} />}
    </ProfileLoader>
  )
}
