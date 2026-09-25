import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SearchHeader } from './index'
import { SearchHeaderSorting } from './search-header-sorting'

vi.mock('@/services/api/use-sugestoes-cursos', () => ({
  useSugestoesCursos: () => ({ sugestoes: [], isLoading: false }),
}))

describe('SearchHeader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('forwards the module to the autocomplete', () => {
    const { container } = render(
      <SearchHeader module="4">
        <SearchHeader.Autocomplete onSearchSubmit={() => {}} />
      </SearchHeader>,
    )

    expect(container.querySelector('[data-module="4"]')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Busque pelo nome do curso'),
    ).toBeInTheDocument()
  })

  it('throws when a subcomponent is used outside SearchHeader', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(<SearchHeaderSorting>Ordenação</SearchHeaderSorting>),
    ).toThrow(/must be rendered inside <SearchHeader>/)
  })
})
