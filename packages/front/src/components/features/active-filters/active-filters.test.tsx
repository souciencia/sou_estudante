import { fireEvent, render, screen } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { ActiveFilters } from './active-filters'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/services/api/use-search-cursos', () => ({
  useSearchCursos: vi.fn(),
}))

describe('ActiveFilters', () => {
  const mockUpdateParams = vi.fn()
  const mockResetFilters = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchCursos).mockReturnValue({
      query: 'direito',
      results: [],
      isLoading: false,
      error: null,
      total: 0,
      currentPage: 1,
      limit: 20,
      links: null,
      setQuery: vi.fn(),
      navigateToPage: vi.fn(),
      updateParams: mockUpdateParams,
      resetFilters: mockResetFilters,
      aggregations: null,
    })
  })

  it('não renderiza nada se não houver filtros ativos além de q e page', () => {
    const params = new URLSearchParams('q=direito&page=1')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    const { container } = render(<ActiveFilters />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza tags para cada filtro ativo e botão para limpar todos', () => {
    const params = new URLSearchParams('q=direito&uf=SP,RJ&turno=Noturno')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    render(<ActiveFilters />)

    expect(screen.getByText('SP')).toBeInTheDocument()
    expect(screen.getByText('RJ')).toBeInTheDocument()
    expect(screen.getByText('Noturno')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /limpar filtros/i }),
    ).toBeInTheDocument()
  })

  it('remove um filtro específico ao clicar no botão de remover da tag', () => {
    const params = new URLSearchParams('q=direito&uf=SP,RJ&turno=Noturno')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    render(<ActiveFilters />)

    const removeSPButton = screen.getByRole('button', {
      name: /remover filtro sp/i,
    })
    fireEvent.click(removeSPButton)

    expect(mockUpdateParams).toHaveBeenCalledWith({
      uf: 'RJ',
      page: '1',
    })
  })

  it('aciona resetFilters ao clicar no botão "Limpar filtros"', () => {
    const params = new URLSearchParams('q=direito&uf=SP')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    render(<ActiveFilters />)

    const clearButton = screen.getByRole('button', { name: /limpar filtros/i })
    fireEvent.click(clearButton)

    expect(mockResetFilters).toHaveBeenCalledTimes(1)
  })
})
