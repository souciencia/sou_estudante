import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { SearchHeaderCursos } from './search-header-cursos'

vi.mock('@/services/api/use-search-cursos', () => ({
  useSearchCursos: vi.fn(),
}))

vi.mock('@/services/api/use-sugestoes-cursos', () => ({
  useSugestoesCursos: vi.fn(),
}))

describe('SearchHeaderCursos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchCursos).mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      updateParams: vi.fn(),
    } as unknown as ReturnType<typeof useSearchCursos>)
    vi.mocked(useSugestoesCursos).mockReturnValue({
      sugestoes: [],
      isLoading: false,
    })
  })

  it('renderiza o autocomplete de busca de cursos', () => {
    render(<SearchHeaderCursos module="4" />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
