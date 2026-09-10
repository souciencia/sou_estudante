import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders its label as a button', () => {
    render(<Button>Enviar</Button>)
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })

  it('calls onClick when pressed', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Enviar</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Enviar
      </Button>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('exposes the module theme through data-module', () => {
    render(<Button module="3">Enviar</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-module', '3')
  })

  it('omits data-module when no module is provided', () => {
    render(<Button>Enviar</Button>)
    expect(screen.getByRole('button')).not.toHaveAttribute('data-module')
  })

  it('keeps a forwarded className', () => {
    render(<Button className="custom-class">Enviar</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
