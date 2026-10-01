import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LayoutSearchPage } from '.'

const renderLayout = (module?: '1' | '4') =>
  render(
    <LayoutSearchPage
      title="Busca de Cursos"
      module={module}
      searchHeader={<p>cabeçalho</p>}
      activeFilters={<p>filtros ativos</p>}
      filtersPanel={<p>filtros</p>}
      toolbar={<p>ordenação</p>}
      results={<p>resultados</p>}
    />,
  )

describe('LayoutSearchPage', () => {
  it('renders the title as the page heading', () => {
    renderLayout()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Busca de Cursos' }),
    ).toBeInTheDocument()
  })

  it('renders every provided slot', () => {
    renderLayout()

    expect(screen.getByText('cabeçalho')).toBeInTheDocument()
    expect(screen.getByText('filtros')).toBeInTheDocument()
    expect(screen.getByText('filtros ativos')).toBeInTheDocument()
    expect(screen.getByText('ordenação')).toBeInTheDocument()
    expect(screen.getByText('resultados')).toBeInTheDocument()
  })

  it('places the filters in a complementary landmark and the results in main', () => {
    renderLayout()

    expect(screen.getByRole('complementary')).toContainElement(
      screen.getByText('filtros'),
    )
    expect(screen.getByRole('main')).toContainElement(
      screen.getByText('resultados'),
    )
  })

  it('tags the container with the module when provided', () => {
    const { container } = renderLayout('4')

    expect(container.querySelector('[data-module="4"]')).toBeInTheDocument()
  })

  it('omits the module attribute when not provided', () => {
    const { container } = renderLayout()

    expect(container.querySelector('[data-module]')).not.toBeInTheDocument()
  })
})
