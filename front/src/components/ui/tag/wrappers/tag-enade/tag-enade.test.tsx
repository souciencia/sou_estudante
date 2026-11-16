import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TagEnade } from './tag-enade'

describe('TagEnade', () => {
  it('renderiza o rótulo numérico da nota', () => {
    render(<TagEnade level={4} />)
    expect(screen.getByText('Nota 4 no Enade')).toBeInTheDocument()
  })

  it('usa a superfície da faixa do Enade como fundo', () => {
    render(<TagEnade level={1} />)
    expect(screen.getByText('Nota 1 no Enade').getAttribute('style')).toContain(
      '--color-low-surface',
    )
  })

  it('colore a nota 5 com a faixa ok', () => {
    render(<TagEnade level={5} />)
    expect(screen.getByText('Nota 5 no Enade').getAttribute('style')).toContain(
      '--color-ok',
    )
  })

  it('cai na neblina quando não há conceito (SC/null)', () => {
    render(<TagEnade level={null} />)
    expect(
      screen.getByText('Sem avaliação no Enade').getAttribute('style'),
    ).toContain('--color-muted')
  })
})
