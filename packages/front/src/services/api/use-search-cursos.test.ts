// src/services/api/use-search-cursos.test.ts
import { act, renderHook, waitFor } from '@testing-library/react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cursoService } from './curso.service'
import type { CursoListResponse } from './types'
import { useSearchCursos } from './use-search-cursos'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('./curso.service', () => ({
  cursoService: {
    searchCursos: vi.fn(),
  },
}))

describe('useSearchCursos', () => {
  const mockReplace = vi.fn()
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cursoService.searchCursos).mockReturnValue(new Promise(() => {}))
    vi.mocked(usePathname).mockReturnValue('/cursos')
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as AppRouterInstance)
  })

  it('lê query e page diretamente dos parâmetros da URL e busca cursos', async () => {
    const params = new URLSearchParams('q=medicina&page=2')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const mockResponse: CursoListResponse = {
      total: 15,
      page: 2,
      limit: 20,
      results: [
        {
          sequencial: 1,
          instituicao: { co_ies: '1' },
          curso: {
            no_curso: 'Medicina',
            in_gratuito: true,
            cine: {},
          },
          localizacao: { in_capital: true },
          censo_metricas: {},
          enade: {},
          tda: {},
          sisu: { tem_sisu: false, ofertas: [] },
        },
      ],
      links: {
        self: '/cursos?q=medicina&page=2',
        first: '/cursos?q=medicina&page=1',
        last: '/cursos?q=medicina&page=2',
      },
    }

    vi.mocked(cursoService.searchCursos).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useSearchCursos())

    expect(result.current.query).toBe('medicina')
    expect(result.current.currentPage).toBe(2)

    await waitFor(() => {
      expect(cursoService.searchCursos).toHaveBeenCalledWith(
        'medicina',
        2,
        20,
        {},
      )
      expect(result.current.results).toHaveLength(1)
      expect(result.current.total).toBe(15)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('repassa os filtros ativos da URL para cursoService.searchCursos', async () => {
    const params = new URLSearchParams('q=medicina&page=1&uf=SP&turno=Noturno')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const { result } = renderHook(() => useSearchCursos())

    expect(result.current.query).toBe('medicina')

    await waitFor(() => {
      expect(cursoService.searchCursos).toHaveBeenCalledWith(
        'medicina',
        1,
        20,
        { uf: 'SP', turno: 'Noturno' },
      )
    })
  })

  it('não busca cursos se o termo tiver menos caracteres que SEARCH_MIN_CHARS', async () => {
    const params = new URLSearchParams('q=med')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const { result } = renderHook(() => useSearchCursos())

    expect(result.current.query).toBe('med')
    expect(result.current.results).toEqual([])
    expect(cursoService.searchCursos).not.toHaveBeenCalled()
  })

  it('atualiza a URL resetando para página 1 ao executar setQuery', () => {
    const params = new URLSearchParams('q=direito&page=3')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const { result } = renderHook(() => useSearchCursos())

    act(() => {
      result.current.setQuery('engenharia')
    })

    expect(mockReplace).toHaveBeenCalledWith('/cursos?q=engenharia&page=1')
  })

  it('atualiza o parâmetro page na URL ao navegar de página', () => {
    const params = new URLSearchParams('q=direito&page=1')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const { result } = renderHook(() => useSearchCursos())

    act(() => {
      result.current.navigateToPage(3)
    })

    expect(mockReplace).toHaveBeenCalledWith('/cursos?q=direito&page=3')
  })

  it('permite atualizar múltiplos parâmetros com updateParams preservando os existentes', () => {
    const params = new URLSearchParams('q=direito&page=1')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const { result } = renderHook(() => useSearchCursos())

    act(() => {
      result.current.updateParams({ sort: 'enade', page: '2' })
    })

    expect(mockReplace).toHaveBeenCalledWith(
      '/cursos?q=direito&page=2&sort=enade',
    )
  })
})
