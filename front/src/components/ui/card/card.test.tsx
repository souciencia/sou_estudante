import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from './index'

describe('Card', () => {
  it('exposes the module theme through data-module', () => {
    render(<Card module="2">Conteúdo</Card>)
    expect(screen.getByText('Conteúdo')).toHaveAttribute('data-module', '2')
  })

  it('lets its tags inherit the module theme from the card', () => {
    render(
      <Card module="3">
        <Card.Tags source={['Gratuito']} />
      </Card>,
    )
    expect(
      screen.getByText('Gratuito').closest('[data-module]'),
    ).toHaveAttribute('data-module', '3')
  })

  it('renders a decorative backdrop behind the content', () => {
    const { container } = render(
      <Card>
        <Card.Backdrop>
          <span>fundo</span>
        </Card.Backdrop>
        <span>conteúdo</span>
      </Card>,
    )

    const backdrop = container.querySelector('[aria-hidden="true"]')
    expect(backdrop).toBeInTheDocument()
    expect(backdrop).toContainElement(screen.getByText('fundo'))
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  it('renders the progress bar no-data state with empty bar and hint', () => {
    const { container } = render(
      <Card>
        <Card.ProgressBar
          title="Taxa de desistência acumulada (5 anos)"
          emptyHint="sem dados"
        />
      </Card>,
    )
    expect(
      screen.getByText('Taxa de desistência acumulada (5 anos) • sem dados'),
    ).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(container.querySelector('.bg-progress-bar-foreground')).toHaveStyle({
      width: '0%',
    })
  })
})
