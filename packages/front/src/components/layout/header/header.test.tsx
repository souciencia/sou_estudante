import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Header } from './header'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}))

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

  describe('inner variant', () => {
    it('renders a back link to home', () => {
      render(<Header variant="inner" />)

      expect(screen.getByRole('button', { name: 'Início' })).toBeInTheDocument()
    })

    it('renders the current module pill with its route', () => {
      render(<Header variant="inner" module="1" />)

      expect(
        screen.getAllByRole('link', { name: 'Escolher curso' })[0],
      ).toHaveAttribute('href', '/cursos')
    })

    it('does not render the SoU_Ciência link', () => {
      render(<Header variant="inner" module="1" />)

      expect(
        screen.queryByRole('link', { name: 'SoU_Ciência' }),
      ).not.toBeInTheDocument()
    })
  })
})
