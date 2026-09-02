// src/components/organisms/search/search-cursos.test.tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { SearchCursos } from './search-cursos'

vi.mock('@/services/api/use-search-cursos', () => ({
  useSearchCursos: vi.fn(),
}))

describe('SearchCursos', () => {
  const mockSetQuery = vi.fn()
  const mockNavigateToPage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchCursos).mockReturnValue({
      query: 'medicina',
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
      isLoading: false,
      error: null,
      total: 1,
      currentPage: 1,
      limit: 20,
      links: null,
      setQuery: mockSetQuery,
      navigateToPage: mockNavigateToPage,
      updateParams: vi.fn(),
    })
  })

  it('preenche o input com o termo da URL e dispara setQuery ao digitar', () => {
    render(<SearchCursos />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('medicina')

    fireEvent.change(input, { target: { value: 'direito' } })
    expect(mockSetQuery).toHaveBeenCalledWith('direito')
  })
})
