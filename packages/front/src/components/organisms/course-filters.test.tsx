// src/components/organisms/course-filters.test.tsx
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { CourseFilters } from './course-filters'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/services/api/use-search-cursos', () => ({
  useSearchCursos: vi.fn(),
}))

describe('CourseFilters', () => {
  const mockUpdateParams = vi.fn()

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
    })
  })

  it('renderiza os grupos de filtros especificados em docs/filtros.md', () => {
    const params = new URLSearchParams()
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    render(<CourseFilters />)

    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Turno · Censo')).toBeInTheDocument()
    expect(screen.getByText('Grau acadêmico')).toBeInTheDocument()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Modalidade')).toBeInTheDocument()
    expect(screen.getByText('Conceito Enade')).toBeInTheDocument()
  })

  it('atualiza os parâmetros da URL ao marcar e desmarcar uma opção de filtro', () => {
    const params = new URLSearchParams('turno=Noturno')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    render(<CourseFilters />)

    const noturnoCheckbox = screen.getByRole('checkbox', { name: 'Noturno' })
    expect(noturnoCheckbox).toBeChecked()

    // Clicar em Federal (adiciona categoria=Federal e reseta page=1)
    const federalCheckbox = screen.getByRole('checkbox', { name: 'Federal' })
    expect(federalCheckbox).not.toBeChecked()

    fireEvent.click(federalCheckbox)
    expect(mockUpdateParams).toHaveBeenCalledWith({
      categoria: 'Federal',
      page: '1',
    })
  })
})
