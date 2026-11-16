import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { BottomSheet } from './bottom-sheet'

function Harness({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir filtros
      </button>
      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false)
          onClose?.()
        }}
        labelledBy="titulo-filtros"
      >
        <h2 id="titulo-filtros">Filtros</h2>
        <button type="button">Opção</button>
      </BottomSheet>
    </>
  )
}

describe('BottomSheet', () => {
  it('starts closed and inert', () => {
    render(<Harness />)

    const dialog = screen.getByRole('dialog', {
      hidden: true,
      name: 'Filtros',
    })

    expect(dialog).toHaveAttribute('inert', '')
  })

  it('opens and moves focus to the close button', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Abrir filtros' }))

    const dialog = screen.getByRole('dialog', { name: 'Filtros' })
    expect(dialog).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: 'Fechar filtros' })).toHaveFocus()
  })

  it('closes and returns focus to the trigger on Escape', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Abrir filtros' }))
    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: 'Abrir filtros' })).toHaveFocus()
    expect(
      screen.getByRole('dialog', { hidden: true, name: 'Filtros' }),
    ).toHaveAttribute('inert', '')
  })

  it('closes when the close button is clicked', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Abrir filtros' }))
    await user.click(screen.getByRole('button', { name: 'Fechar filtros' }))

    expect(
      screen.getByRole('dialog', { hidden: true, name: 'Filtros' }),
    ).toHaveAttribute('inert', '')
  })

  it('closes when the backdrop is clicked', () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('button', { name: 'Abrir filtros' }))

    const backdrop = document.querySelector('div.fixed.inset-0')
    expect(backdrop).not.toBeNull()
    fireEvent.click(backdrop as Element)

    expect(
      screen.getByRole('dialog', { hidden: true, name: 'Filtros' }),
    ).toHaveAttribute('inert', '')
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open onClose={onClose} labelledBy="titulo-filtros">
        <h2 id="titulo-filtros">Filtros</h2>
      </BottomSheet>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
