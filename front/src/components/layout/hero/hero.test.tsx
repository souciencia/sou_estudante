import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from './hero'

describe('Hero', () => {
  it('renders the main heading', () => {
    render(<Hero />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /o destino é seu\.o mapa, nosso\./i,
      }),
    ).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<Hero />)

    expect(
      screen.getByText(
        /encontre cursos, entenda como ingressar, descubra apoios para permanecer/i,
      ),
    ).toBeInTheDocument()
  })

  it('provides a link to search for courses', () => {
    render(<Hero />)

    expect(screen.getByRole('link', { name: /buscar curso/i })).toHaveAttribute(
      'href',
      '/cursos',
    )
  })

  it('provides a link to the how-to section', () => {
    render(<Hero />)

    expect(
      screen.getByRole('link', { name: /como funciona/i }),
    ).toHaveAttribute('href', '#howto')
  })
})
