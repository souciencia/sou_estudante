'use client'

import { useEffect, useState } from 'react'
import { cursoService } from '@/services/api/curso.service'
import type { Curso } from '@/services/api/types'

export interface UseCursoReturn {
  curso: Curso | null
  isLoading: boolean
  error: string | null
  notFound: boolean
}

/**
 * Carrega um curso pelo id no cliente, distinguindo "não encontrado" (404)
 * de falhas de rede/servidor.
 */
export function useCurso(id: string): UseCursoReturn {
  const [curso, setCurso] = useState<Curso | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isCurrent = true

    setIsLoading(true)
    setError(null)
    setNotFound(false)
    setCurso(null)

    cursoService
      .getCurso(id)
      .then((result) => {
        if (!isCurrent) return

        if (result.success) {
          setCurso(result.data)
          return
        }

        if (result.error.statusCode === 404) {
          setNotFound(true)
          return
        }

        setError('Não foi possível carregar o curso. Tente novamente.')
      })
      .catch(() => {
        if (isCurrent) {
          setError('Não foi possível carregar o curso. Tente novamente.')
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [id])

  return { curso, isLoading, error, notFound }
}
