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
      resetFilters: vi.fn(),
      aggregations: null,
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

  it('atualiza os parâmetros da URL de forma cumulativa ao selecionar mais de uma opção no mesmo grupo', () => {
    const params = new URLSearchParams('turno=Noturno')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    render(<CourseFilters />)

    const noturnoCheckbox = screen.getByRole('checkbox', { name: 'Noturno' })
    const diurnoCheckbox = screen.getByRole('checkbox', { name: 'Diurno' })
    expect(noturnoCheckbox).toBeChecked()
    expect(diurnoCheckbox).not.toBeChecked()

    // Clicar em Diurno acumula com Noturno
    fireEvent.click(diurnoCheckbox)
    expect(mockUpdateParams).toHaveBeenCalledWith({
      turno: 'Noturno,Diurno',
      page: '1',
    })
  })

  it('remove apenas a opção desmarcada quando houver múltiplos valores no mesmo filtro', () => {
    const params = new URLSearchParams('turno=Diurno,Noturno')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    render(<CourseFilters />)

    const noturnoCheckbox = screen.getByRole('checkbox', { name: 'Noturno' })
    const diurnoCheckbox = screen.getByRole('checkbox', { name: 'Diurno' })
    expect(noturnoCheckbox).toBeChecked()
    expect(diurnoCheckbox).toBeChecked()

    // Desmarcar Noturno mantém Diurno
    fireEvent.click(noturnoCheckbox)
    expect(mockUpdateParams).toHaveBeenCalledWith({
      turno: 'Diurno',
      page: '1',
    })
  })

  it('remove o parâmetro da URL quando a última opção for desmarcada', () => {
    const params = new URLSearchParams('turno=Noturno')
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )

    render(<CourseFilters />)

    const noturnoCheckbox = screen.getByRole('checkbox', { name: 'Noturno' })
    fireEvent.click(noturnoCheckbox)
    expect(mockUpdateParams).toHaveBeenCalledWith({
      turno: null,
      page: '1',
    })
  })

  it('exibe as contagens dinâmicas resultCount nas opções a partir de aggregations', () => {
    const params = new URLSearchParams()
    vi.mocked(useSearchParams).mockReturnValue(
      params as unknown as ReadonlyURLSearchParams,
    )
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
      resetFilters: vi.fn(),
      aggregations: {
        ufs: [{ key: 'SP', count: 323 }],
        graus: [{ key: 'BACHARELADO', count: 1860 }],
        enades: [{ key: '5', count: 73 }],
      },
    } as unknown as ReturnType<typeof useSearchCursos>)

    render(<CourseFilters />)

    expect(screen.getByText('323')).toBeInTheDocument()
    expect(screen.getByText('1860')).toBeInTheDocument()
    expect(screen.getByText('73')).toBeInTheDocument()
  })
})
