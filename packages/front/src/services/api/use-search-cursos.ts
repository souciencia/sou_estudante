'use client'
import { useCallback, useEffect, useState } from 'react'
import { API_CONFIG } from '@/services/api'
import { cursoService } from '@/services/api/curso.service'
import type { Curso, PaginationLinks } from '@/services/api/types'

export function useSearchCursos(query: string) {
  const [results, setResults] = useState<Curso[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [links, setLinks] = useState<PaginationLinks | null>(null)

  const fetchCursos = useCallback(async (searchQuery: string, page: number) => {
    if (!searchQuery || searchQuery.length < API_CONFIG.SEARCH_MIN_CHARS) {
      setResults([])
      setTotal(0)
      setLinks(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await cursoService.searchCursos(searchQuery, page)
      setResults(response.results)
      setTotal(response.total)
      setLimit(response.limit)
      setLinks(response.links)
      setCurrentPage(response.page)
    } catch (_err) {
      setError('Erro ao buscar cursos')
      setResults([])
      setTotal(0)
      setLinks(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce para mudanças de query (volta para página 1)
  useEffect(() => {
    setCurrentPage(1)

    if (!query || query.length < API_CONFIG.SEARCH_MIN_CHARS) {
      setResults([])
      setTotal(0)
      setLinks(null)
      return
    }

    const timer = setTimeout(() => {
      fetchCursos(query, 1)
    }, API_CONFIG.SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, fetchCursos])

  // Função para navegar usando os links da API (HATEOAS)
  const navigateToPage = useCallback(
    (url: string) => {
      // Extrair page da URL fornecida pela API
      const urlObj = new URL(url, window.location.origin)
      const page = Number.parseInt(urlObj.searchParams.get('page') || '1', 10)
      fetchCursos(query, page)
    },
    [query, fetchCursos],
  )

  return {
    results,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    links,
    navigateToPage,
  }
}
