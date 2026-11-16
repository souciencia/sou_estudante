import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { SearchAutocompleteCursos } from './search-autocomplete-cursos'

vi.mock('@/services/api/use-sugestoes-cursos', () => ({
  useSugestoesCursos: vi.fn(),
}))

describe('SearchAutocompleteCursos', () => {
  beforeEach(() => {
    vi.mocked(useSugestoesCursos).mockReturnValue({
      sugestoes: [{ nome: 'MEDICINA', count: 0 }],
      isLoading: false,
    })
  })

  it('usa as sugestões e os textos do domínio Cursos', () => {
    render(<SearchAutocompleteCursos debounceMs={0} onSearchSubmit={vi.fn()} />)

    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('placeholder', 'Busque pelo nome do curso')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'medic' } })
    expect(screen.getByRole('listbox')).toHaveAccessibleName(
      'Sugestões de cursos',
    )
    expect(screen.getByRole('option', { name: 'MEDICINA' })).toBeInTheDocument()
  })

  it('permite trocar o placeholder', () => {
    render(
      <SearchAutocompleteCursos
        debounceMs={0}
        onSearchSubmit={vi.fn()}
        placeholder="Ex.: Pedagogia"
      />,
    )
    expect(screen.getByPlaceholderText('Ex.: Pedagogia')).toBeInTheDocument()
  })
})
