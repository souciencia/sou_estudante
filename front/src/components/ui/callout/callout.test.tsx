import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Callout } from './index'

describe('Callout', () => {
  it('expõe a variante via data-variant', () => {
    const { container } = render(<Callout v="module">Conteúdo</Callout>)
    expect(container.firstChild).toHaveAttribute('data-variant', 'module')
  })

  it('usa blue como variante padrão', () => {
    const { container } = render(<Callout>Conteúdo</Callout>)
    expect(container.firstChild).toHaveAttribute('data-variant', 'blue')
  })

  it('é anunciado como nota (role=note)', () => {
    render(<Callout>Conteúdo</Callout>)
    expect(screen.getByRole('note')).toBeInTheDocument()
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
