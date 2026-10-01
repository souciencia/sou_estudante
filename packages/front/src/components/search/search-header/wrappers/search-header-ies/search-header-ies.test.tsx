import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchIes } from '@/services/api/use-search-ies'
import { useSugestoesIes } from '@/services/api/use-sugestoes-ies'
import { SearchHeaderIes } from './search-header-ies'

vi.mock('@/services/api/use-search-ies', () => ({
  useSearchIes: vi.fn(),
}))

vi.mock('@/services/api/use-sugestoes-ies', () => ({
  useSugestoesIes: vi.fn(),
}))

describe('SearchHeaderIes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchIes).mockReturnValue({
      query: '',
      setQuery: vi.fn(),
      updateParams: vi.fn(),
    } as unknown as ReturnType<typeof useSearchIes>)
    vi.mocked(useSugestoesIes).mockReturnValue({
      sugestoes: [],
      isLoading: false,
    })
  })

  it('renderiza o autocomplete de instituições', () => {
    render(<SearchHeaderIes module="4" />)

    expect(
      screen.getByPlaceholderText('Busque pelo nome da instituição'),
    ).toBeInTheDocument()
  })
})
