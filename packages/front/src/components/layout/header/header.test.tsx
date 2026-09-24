import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SITE_MENU_LINKS } from '../site-menu/site-menu-links'
import { Header } from './header'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePathname).mockReturnValue('/')
  })

  it('renders a banner landmark', () => {
    render(<Header />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('links the brand to the home page', () => {
    render(<Header />)

    expect(
      screen.getByRole('link', { name: /sou estudante/i }),
    ).toHaveAttribute('href', '/')
  })

  it('renders the site navigation with every page link', () => {
    render(<Header />)

    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' }),
    ).toBeInTheDocument()

    for (const { label } of SITE_MENU_LINKS) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })
})
