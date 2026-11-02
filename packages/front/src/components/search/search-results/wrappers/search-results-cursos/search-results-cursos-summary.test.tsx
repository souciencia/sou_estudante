import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Curso } from '@/services/api/types'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { SearchResultsCursosSummary } from './search-results-cursos-summary'

vi.mock('@/services/api/use-search-cursos', () => ({
  useSearchCursos: vi.fn(),
}))

const curso = {} as Curso

const buildHookReturn = (
  overrides: Partial<ReturnType<typeof useSearchCursos>> = {},
) => ({
  query: 'computação',
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

describe('SearchResultsCursosSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mostra a contagem de cursos encontrados no plural', () => {
    vi.mocked(useSearchCursos).mockReturnValue(
      buildHookReturn({ results: [curso, curso], total: 30 }),
    )

    render(<SearchResultsCursosSummary />)

    expect(screen.getByText('30 cursos encontrados')).toBeInTheDocument()
  })

  it('usa o singular quando há um único curso', () => {
    vi.mocked(useSearchCursos).mockReturnValue(
      buildHookReturn({ results: [curso], total: 1 }),
    )

    render(<SearchResultsCursosSummary />)

    expect(screen.getByText('1 curso encontrado')).toBeInTheDocument()
  })

  it('exibe a tag de gratuitos ao lado da contagem', () => {
    vi.mocked(useSearchCursos).mockReturnValue(
      buildHookReturn({
        results: [curso, curso],
        total: 30,
        aggregations: { ingresso: [{ key: 'gratuito', count: 12 }] },
      }),
    )

    render(<SearchResultsCursosSummary />)

    expect(screen.getByText('12 gratuitos')).toBeInTheDocument()
  })

  it('usa o singular na tag quando há um único gratuito', () => {
    vi.mocked(useSearchCursos).mockReturnValue(
      buildHookReturn({
        results: [curso, curso],
        total: 30,
        aggregations: { ingresso: [{ key: 'gratuito', count: 1 }] },
      }),
    )

    render(<SearchResultsCursosSummary />)

    expect(screen.getByText('1 gratuito')).toBeInTheDocument()
  })

  it('omite a tag quando não há gratuitos', () => {
    vi.mocked(useSearchCursos).mockReturnValue(
      buildHookReturn({ results: [curso, curso], total: 30 }),
    )

    render(<SearchResultsCursosSummary />)

    expect(screen.queryByText(/gratuito/)).not.toBeInTheDocument()
  })

  it('não renderiza nada quando não há resultados', () => {
    vi.mocked(useSearchCursos).mockReturnValue(
      buildHookReturn({ results: [], total: 0 }),
    )

    const { container } = render(<SearchResultsCursosSummary />)

    expect(container).toBeEmptyDOMElement()
  })
})
