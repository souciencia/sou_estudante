'use client'

import { useEffect, useState } from 'react'
import { iesService } from '@/services/api/ies.service'
import type { IES } from '@/services/api/types'

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
export function useIes(id: string): UseIesReturn {
  const [ies, setIes] = useState<IES | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isCurrent = true

    setIsLoading(true)
    setError(null)
    setNotFound(false)
    setIes(null)

    iesService
      .getIes(id)
      .then((result) => {
        if (!isCurrent) return

        if (result.success) {
          setIes(result.data)
          return
        }

        if (result.error.statusCode === 404) {
          setNotFound(true)
          return
        }

        setError('Não foi possível carregar a instituição. Tente novamente.')
      })
      .catch(() => {
        if (isCurrent) {
          setError('Não foi possível carregar a instituição. Tente novamente.')
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [id])

  return { ies, isLoading, error, notFound }
}
