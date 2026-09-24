import { fireEvent, render, screen } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchIes } from '@/services/api/use-search-ies'
import { FiltersPanelIes } from './filters-panel-ies'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/services/api/use-search-ies', () => ({
  useSearchIes: vi.fn(),
}))

describe('FiltersPanelIes', () => {
  const updateParams = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReadonlyURLSearchParams,
    )
    vi.mocked(useSearchIes).mockReturnValue({
      query: '',
      results: [],
      isLoading: false,
      error: null,
      total: 0,
      currentPage: 1,
      limit: 20,
      links: null,
      aggregations: {
        ufs: [{ key: 'SP', count: 5 }],
        regioes: [{ key: 'Sudeste', count: 5 }],
        categorias: [{ key: 'Privada', count: 3 }],
        organizacoes: [{ key: 'Universidade', count: 4 }],
      },
      setQuery: vi.fn(),
      navigateToPage: vi.fn(),
      updateParams,
      resetFilters: vi.fn(),
    })
  })

  it('renderiza os grupos de filtros de IES', () => {
    render(<FiltersPanelIes />)

    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Região')).toBeInTheDocument()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Organização acadêmica')).toBeInTheDocument()
  })

  it('deriva as opções das agregações (UF e região)', () => {
    render(<FiltersPanelIes />)

    expect(screen.getByText('São Paulo')).toBeInTheDocument()
    expect(screen.getByText('Sudeste')).toBeInTheDocument()
    expect(screen.getByText('Universidade')).toBeInTheDocument()
  })

  it('atualiza os parâmetros ao selecionar uma opção', () => {
    render(<FiltersPanelIes />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'São Paulo' }))

    expect(updateParams).toHaveBeenCalledWith({ uf: 'SP', page: '1' })
  })

  it('expõe o tema via data-module', () => {
    const { container } = render(<FiltersPanelIes module="4" />)

    expect(container.firstChild).toHaveAttribute('data-module', '4')
  })
})
