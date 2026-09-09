import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { SearchAutocomplete } from './search-autocomplete'

vi.mock('@/services/api/use-sugestoes-cursos', () => ({
  useSugestoesCursos: vi.fn(),
}))

describe('SearchAutocomplete', () => {
  const mockSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSugestoesCursos).mockReturnValue({
      sugestoes: ['MEDICINA', 'MEDICINA VETERINÁRIA'],
      isLoading: false,
    })
  })

  const renderAutocomplete = () =>
    render(<SearchAutocomplete debounceMs={0} onSearchSubmit={mockSubmit} />)

  it('abre o menu listando as sugestões após digitar', () => {
    renderAutocomplete()
    const input = screen.getByRole('combobox')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'med' } })

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(2)
    expect(screen.getByRole('option', { name: 'MEDICINA' })).toBeInTheDocument()
  })

  it('não abre o menu com termo abaixo do mínimo', () => {
    renderAutocomplete()
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'a' } })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('submete o texto ao pressionar Enter sem opção selecionada', () => {
    render(
      <SearchAutocomplete
        debounceMs={0}
        onSearchSubmit={mockSubmit}
        defaultValue="medicina"
      />,
    )
    const input = screen.getByRole('combobox')

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockSubmit).toHaveBeenCalledWith('medicina')
  })

  it('seleciona a opção destacada ao pressionar Enter após usar setas', () => {
    renderAutocomplete()
    const input = screen.getByRole('combobox')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'med' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockSubmit).toHaveBeenCalledWith('MEDICINA')
  })

  it('seleciona a opção ao clicar e fecha o menu', () => {
    renderAutocomplete()
    const input = screen.getByRole('combobox')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'med' } })
    fireEvent.mouseDown(
      screen.getByRole('option', { name: 'MEDICINA VETERINÁRIA' }),
    )

    expect(mockSubmit).toHaveBeenCalledWith('MEDICINA VETERINÁRIA')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('MEDICINA VETERINÁRIA')
  })

  it('fecha o menu ao pressionar Escape', () => {
    renderAutocomplete()
    const input = screen.getByRole('combobox')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'med' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
