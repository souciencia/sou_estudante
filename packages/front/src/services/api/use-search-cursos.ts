// src/services/api/use-search-cursos.ts
'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_CONFIG } from '@/services/api'
import { cursoService } from '@/services/api/curso.service'
import type { Curso, PaginationLinks } from '@/services/api/types'

export interface UseSearchCursosReturn {
  query: string
  results: Curso[]
  isLoading: boolean
  error: string | null
  total: number
  currentPage: number
  limit: number
  links: PaginationLinks | null
  setQuery: (newQuery: string) => void
  navigateToPage: (pageOrUrl: number | string) => void
  updateParams: (newParams: Record<string, string | null>) => void
  resetFilters: () => void
}

export function useSearchCursos(explicitQuery?: string): UseSearchCursosReturn {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const queryFromUrl = searchParams?.get('q') ?? ''
  const pageParam = searchParams?.get('page')
  const query = explicitQuery !== undefined ? explicitQuery : queryFromUrl
  const currentPage = pageParam ? Number.parseInt(pageParam, 10) || 1 : 1

  const [results, setResults] = useState<Curso[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(20)
  const [links, setLinks] = useState<PaginationLinks | null>(null)

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
      if (key !== 'q' && key !== 'page' && key !== 'limit') {
        filters[key] = value
      }
    }
    return filters
  }, [searchParams])

  useEffect(() => {
    if (!query || query.length < API_CONFIG.SEARCH_MIN_CHARS) {
      setResults((prev) => (prev.length > 0 ? [] : prev))
      setTotal((prev) => (prev > 0 ? 0 : prev))
      setLinks((prev) => (prev !== null ? null : prev))
      setError((prev) => (prev !== null ? null : prev))
      setIsLoading((prev) => (prev ? false : prev))
      return
    }

    let isCurrent = true
    setIsLoading(true)
    setError(null)

    cursoService
      .searchCursos(query, currentPage, limit, activeFilters)
      .then((response) => {
        if (!isCurrent) return
        setResults(response.results)
        setTotal(response.total)
        setLimit(response.limit)
        setLinks(response.links)
      })
      .catch((_err) => {
        if (!isCurrent) return
        setError('Erro ao buscar cursos')
        setResults([])
        setTotal(0)
        setLinks(null)
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [query, currentPage, limit, activeFilters])

  return {
    query,
    results,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    links,
    setQuery,
    navigateToPage,
    updateParams,
    resetFilters,
  }
}
