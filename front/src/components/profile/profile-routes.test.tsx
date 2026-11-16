import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileRoutes } from './profile-routes'

const LINKS = [
  { name: 'Geral', href: '/cursos' },
  { name: 'Ingresso', href: '/ingresso' },
  { name: 'Permanência', href: '/permanencia' },
  { name: 'Instituição', href: '/ies' },
] as const

describe('ProfileRoutes', () => {
  it('renders a navigation landmark for the routes', () => {
    render(<ProfileRoutes />)

    expect(
      screen.getByRole('navigation', { name: 'Rotas' }),
    ).toBeInTheDocument()
  })

  it.each(LINKS)(
    'renders the $name link pointing to $href',
    ({ name, href }) => {
      render(<ProfileRoutes />)

      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    },
  )

  it('marks the active module as the current page', () => {
    render(<ProfileRoutes module="1" />)

    expect(screen.getByRole('link', { name: 'Geral' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('points the routes to the profiles of the displayed course', () => {
    render(<ProfileRoutes module="1" courseId={101} iesId="376" />)

    expect(screen.getByRole('link', { name: 'Geral' })).toHaveAttribute(
      'href',
      '/cursos/101',
    )
    expect(screen.getByRole('link', { name: 'Ingresso' })).toHaveAttribute(
      'href',
      '/ingresso/101',
    )
    expect(screen.getByRole('link', { name: 'Permanência' })).toHaveAttribute(
      'href',
      '/permanencia/101',
    )
    expect(screen.getByRole('link', { name: 'Instituição' })).toHaveAttribute(
      'href',
      '/ies/376?curso=101',
    )
  })

  it('points Instituição to the IES without course context when no course id is provided', () => {
    render(<ProfileRoutes module="4" iesId="376" />)

    expect(screen.getByRole('link', { name: 'Instituição' })).toHaveAttribute(
      'href',
      '/ies/376',
    )
  })

  it('does not mark inactive modules as the current page', () => {
    render(<ProfileRoutes module="1" />)

    expect(screen.getByRole('link', { name: 'Ingresso' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
