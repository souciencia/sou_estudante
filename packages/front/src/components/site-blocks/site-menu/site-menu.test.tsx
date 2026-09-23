import { fireEvent, render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SiteMenu } from './site-menu'
import { SITE_MENU_LINKS } from './site-menu-links'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

const renderMenu = () =>
  render(
    <SiteMenu>
      <SiteMenu.Trigger />
      <SiteMenu.List>
        {SITE_MENU_LINKS.map(({ href, label }) => (
          <SiteMenu.Item key={href} href={href}>
            {label}
          </SiteMenu.Item>
        ))}
      </SiteMenu.List>
    </SiteMenu>,
  )

describe('SiteMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePathname).mockReturnValue('/')
  })

  it('renders the main navigation landmark', () => {
    renderMenu()

    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' }),
    ).toBeInTheDocument()
  })

  it('renders a link for every page of the site', () => {
    renderMenu()

    for (const { href, label } of SITE_MENU_LINKS) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        href,
      )
    }
  })

  it('starts collapsed with an accessible trigger', () => {
    renderMenu()

    const trigger = screen.getByRole('button', { name: 'Abrir menu' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-controls')
  })

  it('expands and collapses through the trigger', () => {
    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))

    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Fechar menu' }))

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('marks the current page link with aria-current', () => {
    vi.mocked(usePathname).mockReturnValue('/cursos')
    renderMenu()

    expect(screen.getByRole('link', { name: 'Cursos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('closes the menu when a link is activated', () => {
    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    fireEvent.click(screen.getByRole('link', { name: 'Cursos' }))

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
