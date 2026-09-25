import { act, renderHook, waitFor } from '@testing-library/react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { iesService } from './ies.service'
import type { IesListResponse } from './types'
import { useSearchIes } from './use-search-ies'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('./ies.service', () => ({
  iesService: {
    searchIes: vi.fn(),
  },
}))

describe('useSearchIes', () => {
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(iesService.searchIes).mockReturnValue(new Promise(() => {}))
    vi.mocked(usePathname).mockReturnValue('/ies')
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as AppRouterInstance)
  })

  it('busca todas as IES quando não há termo (q opcional)', async () => {
    const params = new URLSearchParams()
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const mockResponse: IesListResponse = {
      total: 1,
      page: 1,
      limit: 20,
      results: [{ co_ies: '376', no_ies: 'ANHANGUERA', uf: 'SP' }],
      links: { self: '/ies?page=1', first: '/ies?page=1', last: '/ies?page=1' },
    }
    vi.mocked(iesService.searchIes).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useSearchIes())

    await waitFor(() => {
      expect(iesService.searchIes).toHaveBeenCalledWith('', 1, 20, {})
      expect(result.current.results).toHaveLength(1)
      expect(result.current.total).toBe(1)
    })
  })

  it('repassa os filtros ativos da URL para iesService.searchIes', async () => {
    const params = new URLSearchParams('q=federal&uf=SP&regiao=Sudeste')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    renderHook(() => useSearchIes())

    await waitFor(() => {
      expect(iesService.searchIes).toHaveBeenCalledWith('federal', 1, 20, {
        uf: 'SP',
        regiao: 'Sudeste',
      })
    })
  })

  it('remove os filtros ativos e reseta página mantendo q ao acionar resetFilters', () => {
    const params = new URLSearchParams('q=federal&page=3&uf=SP&sort=az')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const { result } = renderHook(() => useSearchIes())

    act(() => {
      result.current.resetFilters()
    })

    expect(mockReplace).toHaveBeenCalledWith('/ies?q=federal&page=1')
  })

  it('atualiza a URL resetando para página 1 ao executar setQuery', () => {
    const params = new URLSearchParams('q=antiga&page=3')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const { result } = renderHook(() => useSearchIes())

    act(() => {
      result.current.setQuery('nova')
    })

    expect(mockReplace).toHaveBeenCalledWith('/ies?q=nova&page=1')
  })
})
