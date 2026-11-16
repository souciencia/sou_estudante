'use client'

import { iesService } from '@/services/api/ies.service'
import type { IES } from '@/services/api/types'
import { useResource } from './use-resource'

export interface UseIesReturn {
  ies: IES | null
  isLoading: boolean
  error: string | null
  notFound: boolean
}

/**
 * Carrega uma IES pelo co_ies no cliente, distinguindo "não encontrado" (404)
 * de falhas de rede/servidor.
 */
export function useIes(id: string, initialData?: IES): UseIesReturn {
  const { data, isLoading, error, notFound } = useResource<IES>({
    scope: 'ies',
    id,
    fetcher: iesService.getIes,
    errorMessage: 'Não foi possível carregar a instituição. Tente novamente.',
    initialData,
  })

  return { ies: data, isLoading, error, notFound }
}
