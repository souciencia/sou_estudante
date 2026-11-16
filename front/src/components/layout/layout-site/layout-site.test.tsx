import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CompareProvider } from '@/components/compare/compare-provider'
import { LayoutSite } from '.'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ back: vi.fn(), push: vi.fn() })),
}))

const renderShell = () =>
  render(
    <CompareProvider>
      <LayoutSite>
        <p>conteúdo da página</p>
      </LayoutSite>
    </CompareProvider>,
  )

describe('LayoutSite', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/')
  })

  it('renders the header around the page content', () => {
    renderShell()

    expect(
      screen.getByRole('link', { name: /SoU_Estudante/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument()
  })

  it('renders the page content inside the main landmark', () => {
    renderShell()

    expect(screen.getByRole('main')).toContainElement(
      screen.getByText('conteúdo da página'),
    )
  })

  it('provides a skip link to the main landmark', () => {
    renderShell()

    expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo')
    expect(
      screen.getByRole('link', { name: /pular para o conteúdo/i }),
    ).toHaveAttribute('href', '#conteudo')
  })

  it('constrains the header to the home content width on the home page', () => {
    vi.mocked(usePathname).mockReturnValue('/')

    renderShell()

    expect(screen.getByRole('banner')).toHaveClass('max-w-home')
  })

  it('constrains the header to the home content width on list pages', () => {
    vi.mocked(usePathname).mockReturnValue('/cursos')

    renderShell()

    expect(screen.getByRole('banner')).toHaveClass('max-w-home')
  })
})
