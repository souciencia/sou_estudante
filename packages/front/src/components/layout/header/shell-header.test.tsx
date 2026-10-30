import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CompareProvider } from '@/components/compare/compare-provider'
import { ShellHeader } from './shell-header'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ back: vi.fn(), push: vi.fn() })),
}))

const renderAt = (pathname: string) => {
  vi.mocked(usePathname).mockReturnValue(pathname)
  return render(
    <CompareProvider>
      <ShellHeader />
    </CompareProvider>,
  )
}

describe('ShellHeader', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReset()
  })

  it('shows the home header with the site name linking home', () => {
    renderAt('/')

    expect(screen.getByRole('banner')).toHaveClass('max-w-home')
    expect(screen.getByRole('link', { name: /SoU_Estudante/ })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it.each([
    '/cursos',
    '/ies',
    '/ingresso',
    '/comparar',
    '/permanencia',
    '/metodologia',
    '/sobre',
  ])('shows the inner header with the site name on %s', (pathname) => {
    renderAt(pathname)

    expect(screen.getByRole('banner')).toHaveClass('max-w-pages')
    expect(screen.getByRole('link', { name: /SoU_Estudante/ })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('links the inner header to the module of the current route', () => {
    renderAt('/cursos')

    expect(
      screen
        .getAllByRole('link')
        .some((link) => link.getAttribute('href') === '/cursos'),
    ).toBe(true)
  })

  it.each(['/cursos/123', '/ies/456', '/ingresso/789'])(
    'renders header on the detail page %s',
    (pathname) => {
      renderAt(pathname)

      expect(screen.getByRole('banner')).toHaveClass('max-w-2xl')
    },
  )

  it('renders the full-width header on the design system page', () => {
    renderAt('/design-system')

    expect(screen.getByRole('banner')).toHaveClass('max-w-none')
  })
})
