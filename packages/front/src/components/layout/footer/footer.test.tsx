import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './footer'

describe('Footer', () => {
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
})
