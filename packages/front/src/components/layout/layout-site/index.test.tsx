import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LayoutSite } from '.'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

const renderShell = () =>
  render(
    <LayoutSite>
      <p>conteúdo da página</p>
    </LayoutSite>,
  )

describe('LayoutSite', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/')
  })

  it('renders the header and footer around the page content', () => {
    renderShell()

    expect(
      screen.getByRole('link', { name: /SoU_Estudante/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument()
    expect(screen.getByText(/SoU_Ciência · Unifesp/)).toBeInTheDocument()
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

    expect(screen.getByRole('banner')).toHaveClass('min-[860px]:max-w-[900px]')
  })

  it('keeps the header full width on other pages', () => {
    vi.mocked(usePathname).mockReturnValue('/cursos')

    renderShell()

    expect(screen.getByRole('banner')).not.toHaveClass(
      'min-[860px]:max-w-[900px]',
    )
  })
})
