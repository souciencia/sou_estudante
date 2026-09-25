import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ActiveFiltersBar } from './active-filters-bar'

const filters = [
  { key: 'uf', value: 'SP', label: 'São Paulo' },
  { key: 'uf', value: 'RJ', label: 'Rio de Janeiro' },
]

describe('ActiveFiltersBar', () => {
  it('não renderiza nada sem filtros', () => {
    const { container } = render(
      <ActiveFiltersBar filters={[]} onRemove={() => {}} onClear={() => {}} />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renderiza chips e botão de limpar', () => {
    render(
      <ActiveFiltersBar
        filters={filters}
        onRemove={() => {}}
        onClear={() => {}}
      />,
    )

    expect(screen.getByText('São Paulo')).toBeInTheDocument()
    expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /limpar filtros/i }),
    ).toBeInTheDocument()
  })

  it('remove um filtro específico', () => {
    const onRemove = vi.fn()
    render(
      <ActiveFiltersBar
        filters={filters}
        onRemove={onRemove}
        onClear={() => {}}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /remover filtro são paulo/i }),
    )

    expect(onRemove).toHaveBeenCalledWith('uf', 'SP')
  })

  it('limpa todos os filtros', () => {
    const onClear = vi.fn()
    render(
      <ActiveFiltersBar
        filters={filters}
        onRemove={() => {}}
        onClear={onClear}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /limpar filtros/i }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('expõe o tema via data-module', () => {
    render(
      <ActiveFiltersBar
        filters={filters}
        onRemove={() => {}}
        onClear={() => {}}
        module="4"
      />,
    )

    expect(
      screen.getByRole('region', { name: 'Filtros ativos' }),
    ).toHaveAttribute('data-module', '4')
  })
})
