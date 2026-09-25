import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchIes } from '@/services/api/use-search-ies'
import SearchResultSectionIes from './search-result-section-ies'

vi.mock('@/services/api/use-search-ies', () => ({
  useSearchIes: vi.fn(),
}))

describe('SearchResultSectionIes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza os resultados do hook useSearchIes', () => {
    vi.mocked(useSearchIes).mockReturnValue({
      query: '',
      results: [
        {
          co_ies: '3172',
          no_ies: 'UNIVERSIDADE DO ESTADO DO AMAZONAS',
          uf: 'AM',
        },
      ],
      isLoading: false,
      error: null,
      total: 1,
      currentPage: 1,
      limit: 20,
      links: null,
      aggregations: null,
      setQuery: vi.fn(),
      navigateToPage: vi.fn(),
      updateParams: vi.fn(),
      resetFilters: vi.fn(),
    })

    render(<SearchResultSectionIes module="4" />)

    expect(
      screen.getByText('UNIVERSIDADE DO ESTADO DO AMAZONAS'),
    ).toBeInTheDocument()
    expect(screen.getByText('1 instituição encontrada')).toBeInTheDocument()
  })

  it('exibe o estado vazio', () => {
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
      updateParams: vi.fn(),
      resetFilters: vi.fn(),
    })

    render(<SearchResultSectionIes />)

    expect(
      screen.getByText('Nenhuma instituição encontrada'),
    ).toBeInTheDocument()
  })
})
