'use client'

import { useQuery } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type ApiError,
  ERROR_MESSAGES,
  type PaginationLinks,
  type Result,
  type SearchListResponse,
} from './types'

/**
 * Opções do hook de busca paginada genérico.
 * O `fetcher` é a única dependência de domínio, permitindo reutilizar o hook
 * para cursos, IES e futuros módulos. O `scope` compõe a chave de cache do
 * React Query, compartilhada por todos os componentes da mesma rota.
 */
export interface UseSearchOptions<TItem, TAgg> {
  /** Identidade do domínio na chave de cache (ex.: `cursos`, `ies`). */
  scope: string
  fetcher: (
    query: string,
    page: number,
    limit: number,
    filters: Record<string, string | null>,
  ) => Promise<Result<SearchListResponse<TItem, TAgg>>>
  /**
   * Mínimo de caracteres para disparar a busca. Use 0 para permitir
   * listar tudo quando não houver termo (ex.: navegação por filtros).
   */
  minChars?: number
  defaultLimit?: number
  errorMessage?: string
}

export interface UseSearchReturn<TItem, TAgg> {
  query: string
  results: TItem[]
  isLoading: boolean
  error: string | null
  total: number
  currentPage: number
  limit: number
  links: PaginationLinks | null
  aggregations: TAgg | null
  setQuery: (newQuery: string) => void
  navigateToPage: (pageOrUrl: number | string) => void
  updateParams: (newParams: Record<string, string | null>) => void
  resetFilters: () => void
}

const FILTER_META_KEYS = new Set(['q', 'page', 'limit', 'to'])

/**
 * Converte o erro tipado da API (`ApiError`) na mensagem amigável do
 * `ERROR_MESSAGES`, caindo no `fallback` para erros desconhecidos.
 */
function messageForError(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'type' in error) {
    const type = (error as ApiError).type
    if (type in ERROR_MESSAGES) {
      return ERROR_MESSAGES[type]
    }
  }
  return fallback
}

export function useSearch<TItem, TAgg>(
  options: UseSearchOptions<TItem, TAgg>,
  explicitQuery?: string,
): UseSearchReturn<TItem, TAgg> {
  const {
    scope,
    fetcher,
    minChars = 0,
    defaultLimit = 20,
    errorMessage = 'Erro ao buscar resultados',
  } = options

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const queryFromUrl = searchParams?.get('q') ?? ''
  const pageParam = searchParams?.get('page')
  const query = explicitQuery !== undefined ? explicitQuery : queryFromUrl
  const currentPage = pageParam ? Number.parseInt(pageParam, 10) || 1 : 1

  const updateParams = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(
        searchParams ? searchParams.toString() : '',
      )

      for (const [key, value] of Object.entries(newParams)) {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      const queryString = params.toString()
      const url = queryString ? `${pathname}?${queryString}` : pathname
      router.replace(url)
    },
    [searchParams, pathname, router],
  )

  const setQuery = useCallback(
    (newQuery: string) => {
      updateParams({ q: newQuery, page: '1' })
    },
    [updateParams],
  )

  const resetFilters = useCallback(() => {
    const toClear: Record<string, string | null> = {}
    if (searchParams) {
      for (const [key] of searchParams.entries()) {
        if (!FILTER_META_KEYS.has(key)) {
          toClear[key] = null
        }
      }
    }
    toClear.page = '1'
    updateParams(toClear)
  }, [searchParams, updateParams])

  const navigateToPage = useCallback(
    (pageOrUrl: number | string) => {
      if (typeof pageOrUrl === 'number') {
        updateParams({ page: String(pageOrUrl) })
        return
      }

      try {
        const urlObj = new URL(pageOrUrl, 'http://localhost')
        const targetPage = urlObj.searchParams.get('page') || '1'
        updateParams({ page: targetPage })
      } catch {
        updateParams({ page: String(pageOrUrl) })
      }
    },
    [updateParams],
  )

  const activeFilters = useMemo(() => {
    const filters: Record<string, string> = {}
    if (!searchParams) return filters

    for (const [key, value] of searchParams.entries()) {
      if (!FILTER_META_KEYS.has(key)) {
        filters[key] = value
      }
    }
    return filters
  }, [searchParams])

  const enabled = query.length >= minChars

  // O React Query não hidrata a busca no SSR: o servidor renderiza sem dados,
  // enquanto o cliente pode já ter o cache do queryClient populado. Esse guard
  // mantém o primeiro render (servidor e cliente) idêntico — vazio/em carga — e
  // só expõe os dados após a montagem, evitando mismatch de hidratação.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const {
    data,
    isPending,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: [
      'search',
      scope,
      query,
      currentPage,
      defaultLimit,
      activeFilters,
    ],
    queryFn: async () => {
      const result = await fetcher(
        query,
        currentPage,
        defaultLimit,
        activeFilters,
      )
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    enabled,
  })

  return {
    query,
    results: mounted ? (data?.results ?? []) : [],
    isLoading: !mounted || (enabled && isPending),
    error:
      mounted && isError ? messageForError(queryError, errorMessage) : null,
    total: mounted ? (data?.total ?? 0) : 0,
    currentPage,
    limit: mounted ? (data?.limit ?? defaultLimit) : defaultLimit,
    links: mounted ? (data?.links ?? null) : null,
    aggregations: mounted ? (data?.aggregations ?? null) : null,
    setQuery,
    navigateToPage,
    updateParams,
    resetFilters,
  }
}
