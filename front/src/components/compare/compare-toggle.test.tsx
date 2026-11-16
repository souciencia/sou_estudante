import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CompareProvider } from './compare-provider'
import { CompareToggle } from './compare-toggle'

function renderToggle() {
  return render(
    <CompareProvider>
      <CompareToggle module="1" />
    </CompareProvider>,
  )
}

describe('CompareToggle', () => {
  it('renderiza o switch de comparação desativado', () => {
    renderToggle()

    expect(screen.getByRole('switch', { name: 'Comparar' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('ativa o modo de comparação ao alternar', () => {
    renderToggle()

    fireEvent.click(screen.getByRole('switch', { name: 'Comparar' }))

    expect(screen.getByRole('switch', { name: 'Comparar' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})
