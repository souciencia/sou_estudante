import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CompareProvider,
  useCompareCursos,
} from '@/components/compare/compare-provider'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { SearchResultsCursos } from './search-results-cursos'

vi.mock('@/services/api/use-search-cursos', () => ({
  useSearchCursos: vi.fn(),
}))

function renderWithProvider() {
  return render(
    <CompareProvider>
      <SearchResultsCursos />
    </CompareProvider>,
  )
}

function CompararSeeder() {
  const { setComparing } = useCompareCursos()
  return (
    <button type="button" onClick={() => setComparing(true)}>
      enable-compare
    </button>
  )
}

const buildSearchResult = (
  tda: { tda?: number },
  enade: { conceito_faixa_enade?: string } = {},
) => ({
  query: 'computação',
  results: [
    {
      sequencial: 101,
      instituicao: { co_ies: '123' },
      curso: {
        no_curso: 'Ciência da Computação',
        in_gratuito: true,
        cine: {},
      },
      localizacao: { in_capital: true },
      censo_metricas: {},
      enade,
      tda,
      sisu: { tem_sisu: false, ofertas: [] },
    },
  ],
  isLoading: false,
  error: null,
  total: 1,
  currentPage: 1,
  limit: 20,
  links: null,
  setQuery: vi.fn(),
  navigateToPage: vi.fn(),
  updateParams: vi.fn(),
  resetFilters: vi.fn(),
  aggregations: null,
})

describe('SearchResultsCursos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza os resultados obtidos diretamente do hook useSearchCursos sem prop drilling', () => {
    vi.mocked(useSearchCursos).mockReturnValue({
      query: 'computação',
      results: [
        {
          sequencial: 101,
          instituicao: { co_ies: '123' },
          curso: {
            no_curso: 'Ciência da Computação',
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
      isLoading: false,
      error: null,
      total: 1,
      currentPage: 1,
      limit: 20,
      links: null,
      setQuery: vi.fn(),
      navigateToPage: vi.fn(),
      updateParams: vi.fn(),
      resetFilters: vi.fn(),
      aggregations: null,
    })

    renderWithProvider()

    expect(screen.getByText(/Ciência da Computação/)).toBeInTheDocument()
  })

  it('exibe estado de carregamento quando isLoading for true', () => {
    vi.mocked(useSearchCursos).mockReturnValue({
      query: 'computação',
      results: [],
      isLoading: true,
      error: null,
      total: 0,
      currentPage: 1,
      limit: 20,
      links: null,
      setQuery: vi.fn(),
      navigateToPage: vi.fn(),
      updateParams: vi.fn(),
      resetFilters: vi.fn(),
      aggregations: null,
    })

    const { container } = renderWithProvider()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('exibe a taxa de desistência e a tag do Enade quando disponíveis', () => {
    vi.mocked(useSearchCursos).mockReturnValue(
      buildSearchResult({ tda: 51 }, { conceito_faixa_enade: '4' }),
    )

    renderWithProvider()

    expect(screen.getByText('51%')).toBeInTheDocument()
    expect(screen.getByText('Nota 4 no Enade')).toBeInTheDocument()
    expect(screen.queryByText(/sem dados/)).not.toBeInTheDocument()
  })

  it('exibe a tag "SC" quando o curso não tem conceito', () => {
    vi.mocked(useSearchCursos).mockReturnValue(
      buildSearchResult({}, { conceito_faixa_enade: 'SC' }),
    )

    renderWithProvider()

    expect(screen.getByText('Sem conceito no Enade')).toBeInTheDocument()
  })

  it('exibe a tag sem avaliação quando não há conceito nem taxa', () => {
    vi.mocked(useSearchCursos).mockReturnValue(buildSearchResult({}))

    const { container } = renderWithProvider()

    expect(
      screen.getByText('Taxa de desistência acumulada (5 anos) • sem dados'),
    ).toBeInTheDocument()
    expect(screen.getByText('Sem avaliação no Enade')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
    expect(container.querySelector('[data-mask="enade"]')).toBeInTheDocument()
  })

  it('exibe os checkboxes quando o modo de comparação está ativo', () => {
    vi.mocked(useSearchCursos).mockReturnValue(buildSearchResult({}))

    render(
      <CompareProvider>
        <CompararSeeder />
        <SearchResultsCursos />
      </CompareProvider>,
    )

    expect(
      screen.queryByRole('checkbox', {
        name: /Comparar Ciência da Computação/,
      }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'enable-compare' }))

    expect(
      screen.getByRole('checkbox', { name: /Comparar Ciência da Computação/ }),
    ).toBeInTheDocument()
  })
})
