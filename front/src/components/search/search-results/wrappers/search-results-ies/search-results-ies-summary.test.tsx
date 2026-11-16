import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IES } from '@/services/api/types'
import { useSearchIes } from '@/services/api/use-search-ies'
import { SearchResultsIesSummary } from './search-results-ies-summary'

vi.mock('@/services/api/use-search-ies', () => ({
  useSearchIes: vi.fn(),
}))

const ies = {} as IES

const buildHookReturn = (
  overrides: Partial<ReturnType<typeof useSearchIes>> = {},
) => ({
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
  ...overrides,
})

describe('SearchResultsIesSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mostra a contagem de instituições encontradas no plural', () => {
    vi.mocked(useSearchIes).mockReturnValue(
      buildHookReturn({ results: [ies, ies], total: 30 }),
    )

    render(<SearchResultsIesSummary />)

    expect(screen.getByText('30 instituições encontradas')).toBeInTheDocument()
  })

  it('usa o singular quando há uma única instituição', () => {
    vi.mocked(useSearchIes).mockReturnValue(
      buildHookReturn({ results: [ies], total: 1 }),
    )

    render(<SearchResultsIesSummary />)

    expect(screen.getByText('1 instituição encontrada')).toBeInTheDocument()
  })

  it('não renderiza nada quando não há resultados', () => {
    vi.mocked(useSearchIes).mockReturnValue(
      buildHookReturn({ results: [], total: 0 }),
    )

    const { container } = render(<SearchResultsIesSummary />)

    expect(container).toBeEmptyDOMElement()
  })
})
