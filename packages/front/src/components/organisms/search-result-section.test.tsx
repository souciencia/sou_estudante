// src/components/organisms/search-result-section.test.tsx
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import SearchResultSection from './search-result-section'

vi.mock('@/services/api/use-search-cursos', () => ({
  useSearchCursos: vi.fn(),
}))

describe('SearchResultSection', () => {
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
    })

    render(<SearchResultSection />)

    expect(screen.getByText('Ciência da Computação')).toBeInTheDocument()
    expect(screen.getByText('1 curso encontrado')).toBeInTheDocument()
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
    })

    const { container } = render(<SearchResultSection />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })
})
