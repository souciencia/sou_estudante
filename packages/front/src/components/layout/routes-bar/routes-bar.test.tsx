import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RoutesBar } from './routes-bar'

const LINKS = [
  { name: 'Escolher curso', href: '/cursos' },
  { name: 'Como ingressar', href: '/ingresso' },
  { name: 'Como permanecer', href: '/permanencia' },
  { name: 'Conhecer instituição', href: '/ies' },
  { name: 'Comparar cursos', href: '/comparar' },
] as const

describe('RoutesBar', () => {
  it('renders a navigation landmark for the routes', () => {
    render(<RoutesBar />)

    expect(
      screen.getByRole('navigation', { name: 'Rotas' }),
    ).toBeInTheDocument()
  })

  it.each(LINKS)('renders the $name link pointing to $href', ({
    name,
    href,
  }) => {
    render(<RoutesBar />)

    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
  })

  it('marks the active module as the current page', () => {
    render(<RoutesBar module="1" />)

    expect(
      screen.getByRole('link', { name: 'Escolher curso' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark inactive modules as the current page', () => {
    render(<RoutesBar module="1" />)

    expect(
      screen.getByRole('link', { name: 'Como ingressar' }),
    ).not.toHaveAttribute('aria-current')
  })
})
