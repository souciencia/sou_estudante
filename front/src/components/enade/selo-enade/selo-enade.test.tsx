import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeloEnade } from './selo-enade'

describe('SeloEnade', () => {
  it('expõe o conceito numérico no nome acessível e no texto', () => {
    render(<SeloEnade level={4} />)

    const selo = screen.getByRole('img', { name: 'Conceito Enade 4 de 5' })
    expect(selo).toBeInTheDocument()
    expect(selo).toHaveTextContent('4')
  })

  it('descreve o estado sem conceito (SC)', () => {
    render(<SeloEnade level="SC" />)

    expect(
      screen.getByRole('img', { name: 'Sem conceito (SC)' }),
    ).toHaveTextContent('SC')
  })

  it('descreve o estado sem avaliação no ciclo', () => {
    render(<SeloEnade level={null} />)

    const selo = screen.getByRole('img', {
      name: 'Sem avaliação no ciclo',
    })
    expect(selo).toHaveTextContent('—')
  })
})
