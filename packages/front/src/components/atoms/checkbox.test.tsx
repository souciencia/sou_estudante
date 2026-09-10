import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('renders as a checkbox', () => {
    render(<Checkbox aria-label="Aceitar" />)
    expect(
      screen.getByRole('checkbox', { name: 'Aceitar' }),
    ).toBeInTheDocument()
  })

  it('notifies when toggled', () => {
    const onChange = vi.fn()
    render(<Checkbox aria-label="Aceitar" onChange={onChange} />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Aceitar' }))

    expect(onChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Checkbox aria-label="Aceitar" disabled />)
    expect(screen.getByRole('checkbox', { name: 'Aceitar' })).toBeDisabled()
  })

  it('exposes the module theme through data-module', () => {
    render(<Checkbox aria-label="Aceitar" module="3" />)
    expect(screen.getByRole('checkbox', { name: 'Aceitar' })).toHaveAttribute(
      'data-module',
      '3',
    )
  })
})
