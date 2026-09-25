'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PaginationLinks, SearchListResponse } from './types'

/**
 * Opções do hook de busca paginada genérico.
 * O `fetcher` é a única dependência de domínio, permitindo reutilizar o hook
 * para cursos, IES e futuros módulos.
 */
export interface UseSearchOptions<TItem, TAgg> {
  fetcher: (
    query: string,
    page: number,
    limit: number,
    filters: Record<string, string | null>,
  ) => Promise<SearchListResponse<TItem, TAgg>>
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

const FILTER_META_KEYS = new Set(['q', 'page', 'limit'])

export function useSearch<TItem, TAgg>(
  options: UseSearchOptions<TItem, TAgg>,
  explicitQuery?: string,
): UseSearchReturn<TItem, TAgg> {
  const {
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

  const [results, setResults] = useState<TItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(defaultLimit)
  const [links, setLinks] = useState<PaginationLinks | null>(null)
  const [aggregations, setAggregations] = useState<TAgg | null>(null)

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
        if (key !== 'q') {
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

  useEffect(() => {
    if (query.length < minChars) {
      setResults((prev) => (prev.length > 0 ? [] : prev))
      setTotal((prev) => (prev > 0 ? 0 : prev))
      setLinks((prev) => (prev !== null ? null : prev))
      setError((prev) => (prev !== null ? null : prev))
      setAggregations((prev) => (prev !== null ? null : prev))
      setIsLoading((prev) => (prev ? false : prev))
      return
    }

    let isCurrent = true
    setIsLoading(true)
    setError(null)

    fetcher(query, currentPage, limit, activeFilters)
      .then((response) => {
        if (!isCurrent) return
        setResults(response.results)
        setTotal(response.total)
        setLimit(response.limit)
        setLinks(response.links)
        setAggregations(response.aggregations ?? null)
      })
      .catch((_err) => {
        if (!isCurrent) return
        setError(errorMessage)
        setResults([])
        setTotal(0)
        setLinks(null)
        setAggregations(null)
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [
    query,
    minChars,
    currentPage,
    limit,
    activeFilters,
    fetcher,
    errorMessage,
  ])

  return {
    query,
    results,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    links,
    aggregations,
    setQuery,
    navigateToPage,
    updateParams,
    resetFilters,
  }
}
