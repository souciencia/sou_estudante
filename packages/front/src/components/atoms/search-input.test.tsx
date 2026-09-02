// src/components/atoms/search-input.test.tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchInput } from './search-input'

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('atualiza o valor no DOM imediatamente enquanto aguarda o debounce para disparar onSearchChange', () => {
    const handleSearchChange = vi.fn()
    render(
      <SearchInput
        defaultValue=""
        onSearchChange={handleSearchChange}
        debounceMs={300}
      />,
    )

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'med' } })

    // O input reflete a digitação imediatamente para o usuário
    expect(input).toHaveValue('med')

    // Mas onSearchChange ainda NÃO foi chamado antes dos 300ms
    expect(handleSearchChange).not.toHaveBeenCalled()

    // Avança 200ms (ainda não deve ter chamado)
    vi.advanceTimersByTime(200)
    expect(handleSearchChange).not.toHaveBeenCalled()

    // Avança mais 100ms (totalizando 300ms)
    vi.advanceTimersByTime(100)
    expect(handleSearchChange).toHaveBeenCalledTimes(1)
    expect(handleSearchChange).toHaveBeenCalledWith('med')
  })

  it('reinicia o temporizador caso o usuário continue digitando dentro do intervalo', () => {
    const handleSearchChange = vi.fn()
    render(
      <SearchInput
        defaultValue=""
        onSearchChange={handleSearchChange}
        debounceMs={300}
      />,
    )

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'dir' } })
    vi.advanceTimersByTime(200)

    // Digita mais antes de expirar os 300ms
    fireEvent.change(input, { target: { value: 'direito' } })
    vi.advanceTimersByTime(200)
    expect(handleSearchChange).not.toHaveBeenCalled()

    // Avança mais 100ms (300ms desde a última tecla)
    vi.advanceTimersByTime(100)
    expect(handleSearchChange).toHaveBeenCalledTimes(1)
    expect(handleSearchChange).toHaveBeenCalledWith('direito')
  })

  it('dispara onSearchChange imediatamente ao pressionar Enter sem esperar o debounce', () => {
    const handleSearchChange = vi.fn()
    render(
      <SearchInput
        defaultValue=""
        onSearchChange={handleSearchChange}
        debounceMs={300}
      />,
    )

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'engenharia' } })
    expect(handleSearchChange).not.toHaveBeenCalled()

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(handleSearchChange).toHaveBeenCalledTimes(1)
    expect(handleSearchChange).toHaveBeenCalledWith('engenharia')
  })
})
