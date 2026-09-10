import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tag } from './tag'

describe('Tag', () => {
  it('renders its label', () => {
    render(<Tag label="Gratuito" module="1" />)
    expect(screen.getByText('Gratuito')).toBeInTheDocument()
  })

  it('exposes the module theme through data-module', () => {
    render(<Tag label="Gratuito" module="4" />)
    expect(screen.getByText('Gratuito')).toHaveAttribute('data-module', '4')
  })

  it('keeps a forwarded className', () => {
    render(<Tag label="Gratuito" module="1" className="custom-class" />)
    expect(screen.getByText('Gratuito')).toHaveClass('custom-class')
  })
})
