import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'São Paulo, 10 resultados' }),
    ).toBeChecked()
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

  it('renderiza o conteúdo leading antes das seções de filtro', () => {
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => []}
        onToggle={() => {}}
        leading={<span>Ordenar por</span>}
      />,
    )

    const leading = screen.getByText('Ordenar por')
    const firstSection = screen.getByText('Estado')

    expect(leading.compareDocumentPosition(firstSection)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('não renderiza o botão Aplicar no modo desktop', () => {
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => []}
        onToggle={() => {}}
        onApply={() => {}}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Aplicar' }),
    ).not.toBeInTheDocument()
  })
})

describe('FiltersPanel · mobile', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubMobile() {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    )
  }

  it('renderiza um botão-gatilho em vez do card inline', () => {
    stubMobile()
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => []}
        onToggle={() => {}}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Filtros' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('abre o bottom sheet ao clicar no gatilho', async () => {
    stubMobile()
    const user = userEvent.setup()
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => []}
        onToggle={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Filtros' }))

    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Filtros' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('mostra a quantidade de filtros ativos no gatilho', () => {
    stubMobile()
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => ['SP']}
        onToggle={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: 'Filtros' })).toHaveTextContent(
      '1',
    )
  })

  it('omite o contador quando não há filtros ativos', () => {
    stubMobile()
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => []}
        onToggle={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: 'Filtros' })).toHaveTextContent(
      'Filtros',
    )
  })

  it('mantém o painel aberto ao alternar filtros e só aplica no botão Aplicar', async () => {
    stubMobile()
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const onApply = vi.fn()
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => []}
        onToggle={onToggle}
        onApply={onApply}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Filtros' }))
    await user.click(screen.getByRole('checkbox', { name: 'Bahia' }))

    expect(onToggle).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Aplicar' }))

    expect(onApply).toHaveBeenCalledWith({ uf: ['BA'] })
    expect(
      screen.getByRole('dialog', { hidden: true, name: 'Filtros' }),
    ).toHaveAttribute('inert', '')
  })

  it('fecha pelo X sem aplicar o rascunho', async () => {
    stubMobile()
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => []}
        onToggle={() => {}}
        onApply={onApply}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Filtros' }))
    await user.click(screen.getByRole('checkbox', { name: 'Bahia' }))
    await user.click(screen.getByRole('button', { name: 'Fechar filtros' }))

    expect(onApply).not.toHaveBeenCalled()
    expect(
      screen.getByRole('dialog', { hidden: true, name: 'Filtros' }),
    ).toHaveAttribute('inert', '')
  })

  it('pré-seleciona no rascunho os filtros já ativos na URL', async () => {
    stubMobile()
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(
      <FiltersPanel
        sections={sections}
        activeValues={() => ['SP']}
        onToggle={() => {}}
        onApply={onApply}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Filtros' }))

    expect(screen.getByRole('checkbox', { name: 'São Paulo' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(onApply).toHaveBeenCalledWith({ uf: ['SP'] })
  })
})
