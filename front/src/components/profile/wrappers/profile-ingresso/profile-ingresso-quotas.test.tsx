import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileIngressoQuotas } from './profile-ingresso-quotas'

describe('ProfileIngressoQuotas', () => {
  it('shows the quota name, description, cut-off grade and seats', () => {
    render(
      <ProfileIngressoQuotas
        nome="L1"
        descricao="Escola pública, baixa renda"
        nota={712.4}
        vagas={3}
      />,
    )

    expect(screen.getByText('L1')).toBeInTheDocument()
    expect(screen.getByText('Escola pública, baixa renda')).toBeInTheDocument()
    expect(screen.getByText('712,40')).toBeInTheDocument()
    expect(screen.getByText('3 vagas')).toBeInTheDocument()
  })

  it('uses the singular for a single seat', () => {
    render(<ProfileIngressoQuotas nome="L2" nota={650} vagas={1} />)

    expect(screen.getByText('1 vaga')).toBeInTheDocument()
  })

  it('shows a placeholder and hides the seats when there is no cut-off grade', () => {
    render(<ProfileIngressoQuotas nome="L5" nota={undefined} vagas={4} />)

    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByText(/vaga/)).not.toBeInTheDocument()
  })

  it('does not print the seats line when the seat count is unavailable', () => {
    render(<ProfileIngressoQuotas nome="L6" nota={600} vagas={undefined} />)

    expect(screen.queryByText(/vaga/)).not.toBeInTheDocument()
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument()
  })
})
