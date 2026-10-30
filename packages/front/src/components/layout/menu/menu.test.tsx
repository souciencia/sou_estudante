import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import {
  CompareProvider,
  useCompareCursos,
} from '@/components/compare/compare-provider'
import { Menu } from './menu'

const DESKTOP_LINKS = [
  { name: 'Cursos', href: '/cursos' },
  { name: 'Ingresso', href: '/ingresso' },
  { name: 'Permanência', href: '/permanencia' },
  { name: 'Instituições', href: '/ies' },
] as const

const DRAWER_LINKS = [
  { name: 'Início', href: '/' },
  { name: 'Escolher curso', href: '/cursos' },
  { name: 'Como ingressar', href: '/ingresso' },
  { name: 'Como permanecer', href: '/permanencia' },
  { name: 'Conhecer instituição', href: '/ies' },
] as const

function renderMenu(ui: ReactElement) {
  return render(<CompareProvider>{ui}</CompareProvider>)
}

function Seed({ ids }: { ids: string[] }) {
  const { toggle } = useCompareCursos()
  return (
    <button
      type="button"
      onClick={() => {
        for (const id of ids) toggle(id)
      }}
    >
      seed
    </button>
  )
}

describe('Menu', () => {
  it('starts with the menu closed', () => {
    renderMenu(<Menu />)

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('opens the menu when the menu button is clicked', async () => {
    const user = userEvent.setup()

    renderMenu(<Menu />)

    await user.click(screen.getByRole('button', { name: 'Menu' }))

    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeVisible()
  })

  it('moves focus to the close button when opened', async () => {
    const user = userEvent.setup()

    renderMenu(<Menu />)

    await user.click(screen.getByRole('button', { name: 'Menu' }))

    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
  })

  it('closes the menu when the close button is clicked', async () => {
    const user = userEvent.setup()

    renderMenu(<Menu />)

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    await user.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus()
  })

  it('closes the menu when Escape is pressed', async () => {
    const user = userEvent.setup()

    renderMenu(<Menu />)

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus()
  })

  it('renders a navigation landmark for the desktop menu', () => {
    renderMenu(<Menu />)

    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' }),
    ).toBeInTheDocument()
  })

  it.each(DESKTOP_LINKS)(
    'renders the $name link in the desktop nav pointing to $href',
    ({ name, href }) => {
      renderMenu(<Menu />)

      const nav = screen.getByRole('navigation', {
        name: 'Navegação principal',
      })

      expect(within(nav).getByRole('link', { name })).toHaveAttribute(
        'href',
        href,
      )
    },
  )

  it.each(DRAWER_LINKS)(
    'renders the $name link in the drawer pointing to $href',
    ({ name, href }) => {
      renderMenu(<Menu />)

      const drawer = screen.getByRole('dialog', { name: 'Menu' })

      expect(within(drawer).getByRole('link', { name })).toHaveAttribute(
        'href',
        href,
      )
    },
  )

  it('does not render the Metodologia and Sobre links', () => {
    renderMenu(<Menu />)

    expect(
      screen.queryByRole('link', { name: 'Metodologia' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Sobre' }),
    ).not.toBeInTheDocument()
  })

  it('always exposes the compare action in the desktop nav', () => {
    renderMenu(<Menu />)

    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(nav).getByRole('link', { name: 'Comparar' })).toHaveAttribute(
      'href',
      '/comparar',
    )
  })

  it('renders only Cursos and Comparar in the profile variant nav', () => {
    renderMenu(<Menu variant="profile" />)

    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(nav).getByRole('link', { name: 'Cursos' })).toHaveAttribute(
      'href',
      '/cursos',
    )
    expect(within(nav).getByRole('link', { name: 'Comparar' })).toHaveAttribute(
      'href',
      '/comparar',
    )
    expect(
      within(nav).queryByRole('link', { name: 'Ingresso' }),
    ).not.toBeInTheDocument()
    expect(
      within(nav).queryByRole('link', { name: 'Permanência' }),
    ).not.toBeInTheDocument()
    expect(
      within(nav).queryByRole('link', { name: 'Instituições' }),
    ).not.toBeInTheDocument()
  })

  it('shows the number of selected courses and the clear action in the nav', () => {
    render(
      <CompareProvider>
        <Seed ids={['101', '102']} />
        <Menu />
      </CompareProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'seed' }))

    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })

    const link = within(nav).getByRole('link', { name: 'Comparar (2)' })
    expect(link).toHaveClass('font-bold', 'text-accent-deep')
    expect(link.parentElement).toHaveClass('border-accent')
    expect(
      within(nav).getByRole('button', { name: 'Limpar comparação' }),
    ).toBeInTheDocument()
  })

  it('shows the number of selected courses in the drawer', () => {
    render(
      <CompareProvider>
        <Seed ids={['101', '102']} />
        <Menu />
      </CompareProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'seed' }))

    const drawer = screen.getByRole('dialog', { name: 'Menu' })

    expect(
      within(drawer).getByRole('link', { name: 'Comparar cursos (2)' }),
    ).toHaveAttribute('href', '/comparar')
  })

  it('clears the selection from the drawer', async () => {
    const user = userEvent.setup()

    render(
      <CompareProvider>
        <Seed ids={['101', '102']} />
        <Menu />
      </CompareProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'seed' }))
    await user.click(screen.getByRole('button', { name: 'Menu' }))

    const drawer = screen.getByRole('dialog', { name: 'Menu' })

    await user.click(
      within(drawer).getByRole('button', { name: 'Limpar comparação' }),
    )

    expect(
      within(drawer).getByRole('link', { name: 'Comparar cursos' }),
    ).toHaveAttribute('href', '/comparar')
    expect(
      within(drawer).queryByRole('button', { name: 'Limpar comparação' }),
    ).not.toBeInTheDocument()
  })

  it('marks the active module as current in the desktop nav', () => {
    renderMenu(<Menu module="1" />)

    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(nav).getByRole('link', { name: 'Cursos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      within(nav).getByRole('link', { name: 'Ingresso' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('closes the menu when a navigation link is clicked', async () => {
    const user = userEvent.setup()

    renderMenu(<Menu />)

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Menu' })).getByRole('link', {
        name: 'Escolher curso',
      }),
    )

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus()
  })

  it('supports light mode', () => {
    renderMenu(<Menu mode="light" />)

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveClass(
      'bg-fg',
      'text-on-dark',
    )
  })

  it('uses the module accent surface when a module is provided', () => {
    renderMenu(<Menu mode="light" module="2" />)

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveClass(
      'border-accent-deep/50',
      'bg-accent',
      'text-accent-fg',
    )
  })

  it('supports dark mode', () => {
    renderMenu(<Menu mode="dark" />)

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveClass(
      'bg-on-dark/10',
      'text-on-dark',
    )
  })
})
