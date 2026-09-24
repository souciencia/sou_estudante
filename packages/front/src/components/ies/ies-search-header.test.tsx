import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchIes } from '@/services/api/use-search-ies'
import { useSugestoesIes } from '@/services/api/use-sugestoes-ies'
import { IesSearchHeader } from './ies-search-header'

vi.mock('@/services/api/use-search-ies', () => ({
  useSearchIes: vi.fn(),
}))

vi.mock('@/services/api/use-sugestoes-ies', () => ({
  useSugestoesIes: vi.fn(),
}))

describe('IesSearchHeader', () => {
  const updateParams = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchIes).mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      updateParams,
    } as unknown as ReturnType<typeof useSearchIes>)
    vi.mocked(useSugestoesIes).mockReturnValue({
      sugestoes: [],
      isLoading: false,
    })
  })

  it('renderiza o autocomplete de instituições e a ordenação', () => {
    render(<IesSearchHeader module="4" />)

    expect(
      screen.getByPlaceholderText('Busque pelo nome da instituição'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A Z' })).toHaveAttribute(
      'data-module',
      '4',
    )
  })

  it('atualiza o parâmetro sort ao selecionar uma ordenação', () => {
    render(<IesSearchHeader />)

    fireEvent.click(screen.getByRole('button', { name: 'Relevância' }))

    expect(updateParams).toHaveBeenCalledWith({ sort: 'relevancia' })
  })
})
