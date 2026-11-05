import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Footer } from './footer'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}))

describe('Footer', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReset()
  })

  it('credits SoU_Ciência · Unifesp', () => {
    render(<Footer />)

    expect(screen.getByText(/SoU_Ciência · Unifesp/)).toBeInTheDocument()
  })

  it('links to the Creative Commons license', () => {
    render(<Footer />)

    const licenseLink = screen.getByRole('link', {
      name: /licença creative commons/i,
    })

    expect(licenseLink).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/4.0/deed.pt-br',
    )
    expect(licenseLink).toHaveAttribute('target', '_blank')
    expect(licenseLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('mentions the public data sources', () => {
    render(<Footer />)

    expect(
      screen.getByText(/Censo da Educação Superior \(INEP\) · e-MEC · Sisu/),
    ).toBeInTheDocument()
  })

  it('links to the institutional pages', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: 'Sobre' })).toHaveAttribute(
      'href',
      '/sobre',
    )
    expect(screen.getByRole('link', { name: 'Metodologia' })).toHaveAttribute(
      'href',
      '/metodologia',
    )
  })

  it('links to SoU_Ciência and Unifesp in new tabs', () => {
    render(<Footer />)

    const souciencia = screen.getByRole('link', { name: 'SoU_Ciência' })
    expect(souciencia).toHaveAttribute('href', 'https://souciencia.unifesp.br/')
    expect(souciencia).toHaveAttribute('target', '_blank')
    expect(souciencia).toHaveAttribute('rel', 'noopener noreferrer')

    const unifesp = screen.getByRole('link', { name: 'Unifesp' })
    expect(unifesp).toHaveAttribute('href', 'https://www.unifesp.br/')
    expect(unifesp).toHaveAttribute('target', '_blank')
    expect(unifesp).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('links to all module routes', () => {
    render(<Footer />)

    expect(
      screen.getByRole('link', { name: 'Escolher curso' }),
    ).toHaveAttribute('href', '/cursos')
    expect(
      screen.getByRole('link', { name: 'Como ingressar' }),
    ).toHaveAttribute('href', '/ingresso')
    expect(
      screen.getByRole('link', { name: 'Como permanecer' }),
    ).toHaveAttribute('href', '/permanencia')
    expect(
      screen.getByRole('link', { name: 'Conhecer instituição' }),
    ).toHaveAttribute('href', '/ies')
    expect(
      screen.getByRole('link', { name: 'Comparar cursos' }),
    ).toHaveAttribute('href', '/comparar')
  })

  it.each([
    ['/', 'max-w-home'],
    ['/cursos', 'max-w-home'],
    ['/metodologia', 'max-w-home'],
    ['/sobre', 'max-w-home'],
    ['/cursos/123', 'max-w-2xl'],
  ])('uses the %s container width on %s', (pathname, expected) => {
    vi.mocked(usePathname).mockReturnValue(pathname)
    render(<Footer />)

    expect(screen.getByRole('contentinfo')).toHaveClass(expected)
  })
})
