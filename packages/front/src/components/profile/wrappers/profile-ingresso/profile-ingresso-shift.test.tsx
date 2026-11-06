import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Oferta } from '@/services/api'
import { ProfileIngressoShift } from './profile-ingresso-shift'

const ampla: Oferta = {
  modalidade: 'AC',
  turno: 'NOTURNO',
  vagas: 40,
  nota_corte: 650.5,
}

const cota: Oferta = {
  modalidade: 'LB_EP',
  turno: 'NOTURNO',
  descricao:
    'Candidatos com renda familiar bruta per capita igual ou inferior a 1 salário mínimo que tenham cursado integralmente o ensino médio em escolas públicas ou em escolas comunitárias que atuam no âmbito da educação do campo conveniadas com o poder público (Lei nº 12.711/2012).',
  vagas: 5,
  nota_corte: 600,
}

describe('ProfileIngressoShift', () => {
  it('renders nothing when there are no offers', () => {
    const { container } = render(<ProfileIngressoShift ofertas={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows the broad-competition cut-off grade, seats and capitalized shift', () => {
    render(<ProfileIngressoShift ofertas={[ampla]} />)

    expect(screen.getByText(/650,50/)).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(screen.getByText('Noturno')).toBeInTheDocument()
  })

  it('shows placeholders when the broad-competition offer has no grade or seats', () => {
    render(
      <ProfileIngressoShift
        ofertas={[{ modalidade: 'AC', turno: 'MATUTINO' }]}
      />,
    )

    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  it('lists the quota offers after the broad-competition one', () => {
    render(<ProfileIngressoShift ofertas={[ampla, cota]} />)

    expect(screen.getByText('Modalidades de concorrência — Sisu')).toBeInTheDocument()
    expect(
      screen.getByText('Baixa renda · demais candidatos'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Escola pública · renda até 1 salário mínimo por pessoa',
      ),
    ).toBeInTheDocument()
  })

  it('omits the quota section when there are only broad-competition offers', () => {
    render(<ProfileIngressoShift ofertas={[ampla]} />)

    expect(
      screen.queryByText('Modalidades de concorrência — Sisu'),
    ).not.toBeInTheDocument()
  })
})
