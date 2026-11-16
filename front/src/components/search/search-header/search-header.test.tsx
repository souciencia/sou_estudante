import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SearchHeader } from './index'

const autocompleteProps = {
  useSuggestions: () => ({ sugestoes: [], isLoading: false }),
  placeholder: 'Busque pelo nome',
  searchLabel: 'Buscar pelo nome',
  listLabel: 'Sugestões',
}

describe('SearchHeader', () => {
  it('exposes the module theme to the autocomplete through data-module', () => {
    render(
      <SearchHeader module="4">
        <SearchHeader.Autocomplete
          {...autocompleteProps}
          onSearchSubmit={() => {}}
        />
      </SearchHeader>,
    )

    expect(
      screen.getByRole('combobox').closest('[data-module]'),
    ).toHaveAttribute('data-module', '4')
    expect(screen.getByPlaceholderText('Busque pelo nome')).toBeInTheDocument()
  })

  it('renders the actions and sorting slots', () => {
    render(
      <SearchHeader module="1">
        <SearchHeader.Actions>Controles</SearchHeader.Actions>
        <SearchHeader.Sorting>Ordenação</SearchHeader.Sorting>
      </SearchHeader>,
    )

    expect(screen.getByText('Controles')).toBeInTheDocument()
    expect(screen.getByText('Ordenação')).toBeInTheDocument()
  })
})
