import { fireEvent, render, screen } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchIes } from '@/services/api/use-search-ies'
import { IesActiveFilters } from './ies-active-filters'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/services/api/use-search-ies', () => ({
  useSearchIes: vi.fn(),
}))

describe('IesActiveFilters', () => {
  const updateParams = vi.fn()
  const resetFilters = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchIes).mockReturnValue({
      query: '',
      results: [],
      isLoading: false,
      error: null,
      total: 0,
      currentPage: 1,
      limit: 20,
      links: null,
      aggregations: null,
      setQuery: vi.fn(),
      navigateToPage: vi.fn(),
      updateParams,
      resetFilters,
    })
  })

  it('não renderiza nada sem filtros ativos', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReadonlyURLSearchParams,
    )

    const { container } = render(<IesActiveFilters />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza rótulos amigáveis para UF e ordenação', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams(
        'uf=SP&sort=az',
      ) as unknown as ReadonlyURLSearchParams,
    )

    render(<IesActiveFilters />)

    expect(screen.getByText('São Paulo')).toBeInTheDocument()
    expect(screen.getByText('A Z')).toBeInTheDocument()
  })

  it('remove um filtro específico', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('uf=SP,RJ') as unknown as ReadonlyURLSearchParams,
    )

    render(<IesActiveFilters />)

    fireEvent.click(
      screen.getByRole('button', { name: /remover filtro são paulo/i }),
    )

    expect(updateParams).toHaveBeenCalledWith({ uf: 'RJ', page: '1' })
  })

  it('limpa todos os filtros', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('uf=SP') as unknown as ReadonlyURLSearchParams,
    )

    render(<IesActiveFilters />)

    fireEvent.click(screen.getByRole('button', { name: /limpar filtros/i }))

    expect(resetFilters).toHaveBeenCalledTimes(1)
  })
})
