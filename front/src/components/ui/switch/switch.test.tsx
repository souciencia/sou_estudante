import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './switch'

describe('Switch', () => {
  it('exposes its checked state through the switch role', () => {
    render(
      <Switch
        checked={false}
        onCheckedChange={() => {}}
        aria-label="Busca exata"
      />,
    )
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('notifies when toggled', () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        aria-label="Busca exata"
      />,
    )

    fireEvent.click(screen.getByRole('switch'))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('does not notify when disabled', () => {
    const onCheckedChange = vi.fn()
    render(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        disabled
        aria-label="Busca exata"
      />,
    )

    fireEvent.click(screen.getByRole('switch'))

    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('exposes the module theme through data-module', () => {
    render(
      <Switch
        checked
        onCheckedChange={() => {}}
        module="5"
        aria-label="Busca exata"
      />,
    )
    expect(screen.getByRole('switch')).toHaveAttribute('data-module', '5')
  })
})
