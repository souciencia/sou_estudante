import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchAutocomplete } from './search-autocomplete'

const useSuggestions = vi.fn()

const domainProps = {
  useSuggestions,
  placeholder: 'Busque algo',
  searchLabel: 'Buscar item',
  listLabel: 'Sugestões de itens',
}

describe('SearchAutocomplete', () => {
  const mockSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useSuggestions.mockReturnValue({
      sugestoes: [
        { nome: 'MEDICINA', count: 0 },
        { nome: 'MEDICINA VETERINÁRIA', count: 0 },
      ],
      isLoading: false,
    })
  })

  const renderAutocomplete = () =>
    render(
      <SearchAutocomplete
        {...domainProps}
        debounceMs={0}
        onSearchSubmit={mockSubmit}
      />,
    )

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
        {...domainProps}
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

  it('exposes the module theme through data-module', () => {
    render(
      <SearchAutocomplete
        {...domainProps}
        debounceMs={0}
        onSearchSubmit={mockSubmit}
        module="2"
      />,
    )
    expect(
      screen.getByRole('combobox').closest('[data-module]'),
    ).toHaveAttribute('data-module', '2')
  })

  it('mostra a contagem de cursos quando disponível', () => {
    useSuggestions.mockReturnValue({
      sugestoes: [{ nome: 'MEDICINA', count: 300 }],
      isLoading: false,
    })
    renderAutocomplete()
    const input = screen.getByRole('combobox')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'med' } })

    expect(screen.getByText('300 cursos')).toBeInTheDocument()
  })

  it('exibe a sigla após o nome quando disponível', () => {
    useSuggestions.mockReturnValue({
      sugestoes: [
        { nome: 'UNIVERSIDADE DE SÃO PAULO', sigla: 'USP', count: 0 },
      ],
      isLoading: false,
    })
    renderAutocomplete()
    const input = screen.getByRole('combobox')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'usp' } })

    expect(
      screen.getByRole('option', {
        name: /UNIVERSIDADE DE SÃO PAULO\s*\(USP\)/,
      }),
    ).toBeInTheDocument()
  })

  it('uses only the labels and hook injected by the domain', () => {
    renderAutocomplete()
    expect(screen.getByPlaceholderText('Busque algo')).toBeInTheDocument()
    expect(screen.getByText('Buscar item')).toBeInTheDocument()
    expect(useSuggestions).toHaveBeenCalled()
  })
})
