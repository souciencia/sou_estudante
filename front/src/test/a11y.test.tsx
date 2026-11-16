import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchAutocomplete } from '@/components/search/search-autocomplete/search-autocomplete'
import { ErrorMessage } from '@/components/ui/error-message'
import { findA11yViolations } from './a11y'

const useSuggestions = () => ({ sugestoes: [], isLoading: false })

describe('acessibilidade (axe-core)', () => {
  it('ErrorMessage não tem violações', async () => {
    const { container } = render(<ErrorMessage message="Algo falhou" />)

    expect(await findA11yViolations(container)).toEqual([])
  })

  it('SearchAutocomplete não tem violações', async () => {
    const { container } = render(
      <SearchAutocomplete
        useSuggestions={useSuggestions}
        onSearchSubmit={vi.fn()}
        placeholder="Buscar"
        searchLabel="Buscar"
        listLabel="Sugestões"
      />,
    )

    expect(await findA11yViolations(container)).toEqual([])
  })
})
