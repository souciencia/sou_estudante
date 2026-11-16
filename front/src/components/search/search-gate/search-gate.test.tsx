import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchGate } from './search-gate'

const mockSearchParams = vi.hoisted(() => ({ value: new URLSearchParams() }))

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams.value,
}))

const renderGate = (query: string, minQueryLength?: number) => {
  mockSearchParams.value = new URLSearchParams(query)
  return render(
    <SearchGate minQueryLength={minQueryLength} fallback={<p>sem busca</p>}>
      <p>resultados</p>
    </SearchGate>,
  )
}

describe('SearchGate', () => {
  it('mostra o conteúdo quando q tem o tamanho mínimo', () => {
    renderGate('q=medicina')
    expect(screen.getByText('resultados')).toBeInTheDocument()
    expect(screen.queryByText('sem busca')).not.toBeInTheDocument()
  })

  it('mostra o fallback sem q ou com q em branco', () => {
    renderGate('q=%20%20')
    expect(screen.getByText('sem busca')).toBeInTheDocument()
    expect(screen.queryByText('resultados')).not.toBeInTheDocument()
  })

  it('respeita o tamanho mínimo configurado', () => {
    renderGate('q=ab', 3)
    expect(screen.getByText('sem busca')).toBeInTheDocument()
  })
})
