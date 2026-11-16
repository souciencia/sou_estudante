import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MODULE_META } from '@/lib/module'
import { LayoutSearchPage } from '.'

const mockSearchParams = vi.hoisted(() => ({ value: new URLSearchParams() }))

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams.value,
}))

/** Renderiza o layout simulando a URL com (`?q=`) ou sem termo de busca. */
const renderLayout = (module?: '1' | '4', withQuery = true) => {
  mockSearchParams.value = new URLSearchParams(withQuery ? 'q=medicina' : '')
  return render(
    <LayoutSearchPage
      module={module}
      searchHeader={<p>cabeçalho</p>}
      activeFilters={<p>filtros ativos</p>}
      filtersPanel={<p>filtros</p>}
      toolbar={<p>ordenação</p>}
      resultsSummary={<p>resumo</p>}
      results={<p>resultados</p>}
    />,
  )
}

describe('LayoutSearchPage', () => {
  it('renders the module hero as the page heading', () => {
    renderLayout('1')

    const { lead, accent } = MODULE_META['1'].page

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${lead} ${accent}`,
      }),
    ).toBeInTheDocument()
  })

  it('renders every provided slot', () => {
    renderLayout()

    expect(screen.getByText('cabeçalho')).toBeInTheDocument()
    expect(screen.getByText('filtros')).toBeInTheDocument()
    expect(screen.getByText('filtros ativos')).toBeInTheDocument()
    expect(screen.getByText('ordenação')).toBeInTheDocument()
    expect(screen.getByText('resumo')).toBeInTheDocument()
    expect(screen.getByText('resultados')).toBeInTheDocument()
  })

  it('places the summary and the toolbar in the same flex row', () => {
    renderLayout()

    const summary = screen.getByText('resumo')
    const toolbar = screen.getByText('ordenação')

    expect(summary.parentElement).toBe(toolbar.parentElement)
    expect(summary.parentElement).toHaveClass('justify-between')
  })

  it('places the filters in a complementary landmark and the results outside it', () => {
    renderLayout()

    expect(screen.getByRole('complementary')).toContainElement(
      screen.getByText('filtros'),
    )
    // O `<main>` é do LayoutSite; aqui os resultados ficam em uma coluna interna.
    expect(screen.getByRole('complementary')).not.toContainElement(
      screen.getByText('resultados'),
    )
  })

  it('tags the container with the module when provided', () => {
    const { container } = renderLayout('4')

    expect(container.querySelector('[data-module="4"]')).toBeInTheDocument()
  })

  it('hides filters, sorting and results until a search is made', () => {
    renderLayout(undefined, false)

    expect(screen.getByText('cabeçalho')).toBeInTheDocument()
    expect(screen.queryByText('filtros')).not.toBeInTheDocument()
    expect(screen.queryByText('filtros ativos')).not.toBeInTheDocument()
    expect(screen.queryByText('ordenação')).not.toBeInTheDocument()
    expect(screen.queryByText('resultados')).not.toBeInTheDocument()
    expect(
      screen.getByText('Faça uma busca para ver os resultados'),
    ).toBeInTheDocument()
  })

  it('shows the filters, sorting and results once a search is made', () => {
    renderLayout(undefined, true)

    expect(screen.getByText('filtros')).toBeInTheDocument()
    expect(screen.getByText('ordenação')).toBeInTheDocument()
    expect(screen.getByText('resultados')).toBeInTheDocument()
  })

  it('hides the notice once a search is made', () => {
    mockSearchParams.value = new URLSearchParams('')

    const { rerender } = render(
      <LayoutSearchPage
        module="4"
        notice={<p>aviso</p>}
        searchHeader={<p>cabeçalho</p>}
      />,
    )

    expect(screen.getByText('aviso')).toBeInTheDocument()

    mockSearchParams.value = new URLSearchParams('q=medicina')
    rerender(
      <LayoutSearchPage
        module="4"
        notice={<p>aviso</p>}
        searchHeader={<p>cabeçalho</p>}
      />,
    )

    expect(screen.queryByText('aviso')).not.toBeInTheDocument()
  })

  it('omits the module attribute when not provided', () => {
    const { container } = renderLayout()

    expect(container.firstElementChild).not.toHaveAttribute('data-module')
  })

  it('renders only the hero when no domain slots are provided', () => {
    render(<LayoutSearchPage module="2" />)

    const { lead, accent } = MODULE_META['2'].page

    expect(
      screen.getByRole('heading', { level: 1, name: `${lead} ${accent}` }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.queryByText('Buscar')).not.toBeInTheDocument()
  })

  it('renders the search entry slot between the hero and the notice', () => {
    mockSearchParams.value = new URLSearchParams('')

    render(
      <LayoutSearchPage
        searchEntry={<p>entrada de busca</p>}
        notice={<p>aviso</p>}
      />,
    )

    expect(screen.getByText('entrada de busca')).toBeInTheDocument()
    expect(screen.getByText('aviso')).toBeInTheDocument()
  })
})
