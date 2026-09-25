'use client'

import { cursoService } from '@/services/api/curso.service'
import type { Curso, SearchAggregations } from '@/services/api/types'
import { API_CONFIG } from './config'
import { type UseSearchReturn, useSearch } from './use-search'

export type UseSearchCursosReturn = UseSearchReturn<Curso, SearchAggregations>

export function useSearchCursos(explicitQuery?: string): UseSearchCursosReturn {
  return useSearch<Curso, SearchAggregations>(
    {
      fetcher: cursoService.searchCursos,
      minChars: API_CONFIG.SEARCH_MIN_CHARS,
      errorMessage: 'Erro ao buscar cursos',
    },
    explicitQuery,
  )
}
