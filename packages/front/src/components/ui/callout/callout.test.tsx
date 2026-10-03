import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Callout } from './index'

describe('Callout', () => {
  it('renderiza o conteúdo', () => {
    render(<Callout>Conteúdo do callout</Callout>)
    expect(screen.getByText('Conteúdo do callout')).toBeInTheDocument()
  })

  it('expõe a variante via data-variant', () => {
    const { container } = render(<Callout v="future">Conteúdo</Callout>)
    expect(container.firstChild).toHaveAttribute('data-variant', 'future')
  })

  it('é anunciado como nota (role=note)', () => {
    render(<Callout>Conteúdo</Callout>)
    expect(screen.getByRole('note')).toBeInTheDocument()
  })

  it('renderiza as partes compostas', () => {
    render(
      <Callout>
        <Callout.Header>
          <Callout.Icon>★</Callout.Icon>
          <Callout.HeaderContent>
            <Callout.Tagline>Tagline</Callout.Tagline>
            <Callout.Title>Título</Callout.Title>
          </Callout.HeaderContent>
        </Callout.Header>
        <Callout.Content>Corpo</Callout.Content>
        <Callout.Footer>Rodapé</Callout.Footer>
      </Callout>,
    )

    expect(screen.getByText('Tagline')).toBeInTheDocument()
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Corpo')).toBeInTheDocument()
    expect(screen.getByText('Rodapé')).toBeInTheDocument()
  })

  it('marca o ícone como decorativo por padrão', () => {
    render(
      <Callout>
        <Callout.Icon>★</Callout.Icon>
      </Callout>,
    )
    expect(screen.getByText('★')).toHaveAttribute('aria-hidden', 'true')
  })

  it('permite escolher o nível do título', () => {
    render(
      <Callout>
        <Callout.Title as="h3">Título</Callout.Title>
      </Callout>,
    )
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Título',
    )
  })

  it('não transforma o título em heading por padrão (evita pular níveis)', () => {
    render(
      <Callout>
        <Callout.Title>Título</Callout.Title>
      </Callout>,
    )
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
