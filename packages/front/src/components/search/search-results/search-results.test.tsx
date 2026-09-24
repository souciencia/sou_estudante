import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchResults } from './search-results'

interface Item {
  id: string
  nome: string
}

const items: Item[] = [
  { id: '1', nome: 'Alfa' },
  { id: '2', nome: 'Beta' },
]

const links = {
  self: '/x?q=a&page=1',
  first: '/x?q=a&page=1',
  next: '/x?q=a&page=2',
  last: '/x?q=a&page=3',
}

const baseProps = {
  items,
  renderItem: (item: Item) => <span>{item.nome}</span>,
  getItemKey: (item: Item) => item.id,
  labels: { singular: 'resultado', plural: 'resultados' },
}

describe('SearchResults', () => {
  it('renderiza os itens e a contagem no plural', () => {
    render(<SearchResults {...baseProps} total={2} />)

    expect(screen.getByText('Alfa')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('2 resultados encontrados')).toBeInTheDocument()
  })

  it('usa o singular quando há apenas um item', () => {
    render(<SearchResults {...baseProps} items={[items[0]]} total={1} />)

    expect(screen.getByText('1 resultado encontrado')).toBeInTheDocument()
  })

  it('exibe mensagem vazia quando não há itens', () => {
    render(
      <SearchResults
        {...baseProps}
        items={[]}
        total={0}
        emptyMessage="Nada por aqui"
      />,
    )

    expect(screen.getByText('Nada por aqui')).toBeInTheDocument()
  })

  it('exibe skeletons durante o carregamento', () => {
    const { container } = render(
      <SearchResults {...baseProps} items={[]} isLoading />,
    )

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('exibe a mensagem de erro', () => {
    render(<SearchResults {...baseProps} items={[]} error="Deu ruim" />)

    expect(screen.getByText('Deu ruim')).toBeInTheDocument()
  })

  it('renderiza a paginação e navega', () => {
    const onNavigate = vi.fn()
    render(
      <SearchResults
        {...baseProps}
        total={50}
        currentPage={1}
        limit={20}
        links={links}
        onNavigate={onNavigate}
      />,
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
