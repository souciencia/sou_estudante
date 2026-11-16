'use client'

import { useQuery } from '@tanstack/react-query'
import type { ApiError, Result } from './types'

export interface UseResourceOptions<TData> {
  /** Identidade do domínio na chave de cache (ex.: `curso`, `ies`). */
  scope: string
  id: string
  fetcher: (id: string) => Promise<Result<TData>>
  /** Mensagem mostrada quando a falha não é um 404. */
  errorMessage: string
  /** Dado já carregado no servidor, exibido de imediato sem novo fetch. */
  initialData?: TData
}

export interface UseResourceReturn<TData> {
  data: TData | null
  isLoading: boolean
  error: string | null
  notFound: boolean
}

function isNotFound(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    (error as ApiError).statusCode === 404
  )
}

/**
 * Hook genérico de carregamento de um recurso por id, distinguindo "não
 * encontrado" (404) de falhas de rede/servidor. Reutilizado por cursos e IES.
 */
export function useResource<TData>({
  scope,
  id,
  fetcher,
  errorMessage,
  initialData,
}: UseResourceOptions<TData>): UseResourceReturn<TData> {
  const enabled = Boolean(id?.trim())

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['resource', scope, id],
    queryFn: async () => {
      const result = await fetcher(id)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    enabled,
    initialData,
  })

  const notFound = isError && isNotFound(error)

  return {
    data: data ?? null,
    isLoading: enabled && isPending,
    error: isError && !notFound ? errorMessage : null,
    notFound,
  }
}
