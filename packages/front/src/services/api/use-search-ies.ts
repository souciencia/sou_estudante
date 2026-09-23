// src/services/api/use-search-ies.ts
'use client'

import { iesService } from '@/services/api/ies.service'
import type { IES, IesSearchAggregations } from '@/services/api/types'
import { type UseSearchReturn, useSearch } from './use-search'

export type UseSearchIesReturn = UseSearchReturn<IES, IesSearchAggregations>

export function useSearchIes(explicitQuery?: string): UseSearchIesReturn {
  return useSearch<IES, IesSearchAggregations>(
    {
      fetcher: iesService.searchIes,
      // q é opcional: sem termo listamos todas as IES
      minChars: 0,
      errorMessage: 'Erro ao buscar IES',
    },
    explicitQuery,
  )
}
