import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from './header'

describe('Header', () => {
  it('links the application logo to the home page', () => {
    render(<Header />)

    const homeLink = screen.getByRole('link', {
      name: /SoU_Estudante/,
    })

    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('links to SoU_Ciência', () => {
    render(<Header />)

    const cienciaLink = screen.getByRole('link', {
      name: 'SoU_Ciência',
    })

    expect(cienciaLink).toHaveAttribute('href', 'https://souciencia.unifesp.br')
  })

  it('opens SoU_Ciência in a new tab', () => {
    render(<Header />)

    const cienciaLink = screen.getByRole('link', {
      name: 'SoU_Ciência',
    })

    expect(cienciaLink).toHaveAttribute('target', '_blank')
    expect(cienciaLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders the menu', () => {
    render(<Header />)

    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })
})
