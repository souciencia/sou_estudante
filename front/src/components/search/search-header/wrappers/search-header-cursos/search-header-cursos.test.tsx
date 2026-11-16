import { render, screen } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CompareProvider } from '@/components/compare/compare-provider'
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

  it('propaga o módulo para os controles do cabeçalho', () => {
    render(
      <CompareProvider>
        <SearchHeaderCursos module="4" />
      </CompareProvider>,
    )

    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBeGreaterThan(0)
    for (const control of switches) {
      expect(control).toHaveAttribute('data-module', '4')
    }
  })

  it('exibe os alternadores de busca exata e de comparação lado a lado', () => {
    render(
      <CompareProvider>
        <SearchHeaderCursos module="4" />
      </CompareProvider>,
    )

    expect(
      screen.getByRole('switch', { name: 'Busca exata' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Comparar' })).toBeInTheDocument()
  })
})
