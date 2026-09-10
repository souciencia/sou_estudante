import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from './index'

describe('Card', () => {
  it('renders its content', () => {
    render(<Card>Conteúdo</Card>)
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  it('exposes the module theme through data-module', () => {
    render(<Card module="2">Conteúdo</Card>)
    expect(screen.getByText('Conteúdo')).toHaveAttribute('data-module', '2')
  })

  it('shares the module with its tags', () => {
    render(
      <Card module="3">
        <Card.Tags source={['Gratuito']} />
      </Card>,
    )
    expect(screen.getByText('Gratuito')).toHaveAttribute('data-module', '3')
  })

  it('renders the header title and subtitle', () => {
    render(
      <Card>
        <Card.Header title="Direito" subtitle="USP" />
      </Card>,
    )
    expect(screen.getByText('Direito')).toBeInTheDocument()
    expect(screen.getByText('USP')).toBeInTheDocument()
  })

  it('renders the progress bar title and percentage', () => {
    render(
      <Card>
        <Card.ProgressBar title="Nota de corte" percentage="50%" />
      </Card>,
    )
    expect(screen.getByText('Nota de corte')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders the enade score', () => {
    render(
      <Card>
        <Card.IconEnade n="4" />
      </Card>,
    )
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('Enade')).toBeInTheDocument()
  })
})
