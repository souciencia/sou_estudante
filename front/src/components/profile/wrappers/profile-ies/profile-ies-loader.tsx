'use client'

import type { IES } from '@/services/api/types'
import { useIes } from '@/services/api/use-ies'
import { ProfileLoader } from '../../profile-loader'
import { ProfileIES } from './profile-ies'

interface ProfileIESLoaderProps {
  id: string
  initialData?: IES
  /** Id do curso de origem, usado para voltar aos perfis do mesmo curso. */
  courseId?: number
}

export const ProfileIESLoader = ({
  id,
  initialData,
  courseId,
}: ProfileIESLoaderProps) => {
  const { ies, isLoading, error, notFound } = useIes(id, initialData)

  return (
    <ProfileLoader
      data={ies}
      isLoading={isLoading}
      error={error}
      notFound={notFound}
      notFoundTitle="Instituição não encontrada"
      notFoundDescription="A instituição que você procura não existe ou foi removida."
      fallbackError="Não foi possível carregar a instituição."
      backHref="/ies"
    >
      {(data) => <ProfileIES ies={data} courseId={courseId} />}
    </ProfileLoader>
  )
}
