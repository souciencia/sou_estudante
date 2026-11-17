import { render, screen } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { SearchHeaderCursos } from './search-header-cursos'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/services/api/use-search-cursos', () => ({
  useSearchCursos: vi.fn(),
}))

vi.mock('@/services/api/use-sugestoes-cursos', () => ({
  useSugestoesCursos: vi.fn(),
}))

describe('SearchHeaderCursos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReadonlyURLSearchParams,
    )
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

  it('propaga o módulo para o alternador de busca exata', () => {
    vi.mocked(useSearchCursos).mockReturnValue({
      query: 'pedagogia',
      setQuery: vi.fn(),
      updateParams: vi.fn(),
    } as unknown as ReturnType<typeof useSearchCursos>)

    render(<SearchHeaderCursos module="4" />)

    expect(screen.getByRole('switch', { name: 'Busca exata' })).toHaveAttribute(
      'data-module',
      '4',
    )
  })

  it('exibe o alternador de busca exata quando há busca', () => {
    vi.mocked(useSearchCursos).mockReturnValue({
      query: 'pedagogia',
      setQuery: vi.fn(),
      updateParams: vi.fn(),
    } as unknown as ReturnType<typeof useSearchCursos>)

    render(<SearchHeaderCursos module="4" />)

    expect(
      screen.getByRole('switch', { name: 'Busca exata' }),
    ).toBeInTheDocument()
  })

  it('oculta o alternador e a dica de busca exata quando não há busca', () => {
    render(<SearchHeaderCursos module="4" />)

    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Retorna somente o curso com esse nome exato/),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Também inclui cursos com nome parecido/),
    ).not.toBeInTheDocument()
  })
})
