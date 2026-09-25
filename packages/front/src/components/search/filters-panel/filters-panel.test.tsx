import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type FilterSectionDefinition, FiltersPanel } from './filters-panel'

const sections: FilterSectionDefinition[] = [
  {
    key: 'uf',
    title: 'Estado',
    aggregationKey: 'ufs',
    options: [
      { label: 'São Paulo', value: 'SP' },
      { label: 'Bahia', value: 'BA' },
    ],
  },
]

describe('FiltersPanel', () => {
  it('renderiza grupos, opções e contagens das agregações', () => {
    render(
      <FiltersPanel
        sections={sections}
        aggregations={{ ufs: [{ key: 'SP', count: 10 }] }}
        activeValues={() => ['SP']}
        onToggle={() => {}}
      />,
    )

    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('São Paulo')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'São Paulo' })).toBeChecked()
  })

  it('dispara onToggle com a chave do filtro e o valor', () => {
    const onToggle = vi.fn()
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => []}
        onToggle={onToggle}
      />,
    )

    fireEvent.click(screen.getByRole('checkbox', { name: 'Bahia' }))

    expect(onToggle).toHaveBeenCalledWith('uf', 'BA')
  })

  it('expande e recolhe opções excedentes', () => {
    const sectionWithMore: FilterSectionDefinition[] = [
      {
        key: 'uf',
        title: 'Estado',
        aggregationKey: 'ufs',
        visibleCount: 1,
        moreLabel: (hidden) => `+ ${hidden} opções`,
        lessLabel: 'Ver menos',
        options: [
          { label: 'São Paulo', value: 'SP' },
          { label: 'Bahia', value: 'BA' },
          { label: 'Rio de Janeiro', value: 'RJ' },
        ],
      },
    ]

    render(
      <FiltersPanel
        sections={sectionWithMore}
        activeValues={() => []}
        onToggle={() => {}}
      />,
    )

    expect(screen.queryByText('Rio de Janeiro')).not.toBeInTheDocument()
    expect(screen.getByText('+ 2 opções')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /\+ 2 opções/i }))

    expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument()
    expect(screen.getByText('Ver menos')).toBeInTheDocument()
  })

  it('expõe o tema via data-module', () => {
    const { container } = render(
      <FiltersPanel
        sections={sections}
        activeValues={() => []}
        onToggle={() => {}}
        module="4"
      />,
    )

    expect(container.firstChild).toHaveAttribute('data-module', '4')
  })
})
