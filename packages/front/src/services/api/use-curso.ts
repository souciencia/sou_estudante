'use client'

import { cursoService } from '@/services/api/curso.service'
import type { Curso } from '@/services/api/types'
import { useResource } from './use-resource'

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
export function useCurso(id: string, initialData?: Curso): UseCursoReturn {
  const { data, isLoading, error, notFound } = useResource<Curso>({
    scope: 'curso',
    id,
    fetcher: cursoService.getCurso,
    errorMessage: 'Não foi possível carregar o curso. Pode ser uma instabilidade temporária. Tente novamente em alguns instantes.',
    initialData,
  })

  return { curso: data, isLoading, error, notFound }
}
