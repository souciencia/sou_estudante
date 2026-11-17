import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Curso } from '@/services/api/types'
import { ProfileCursosQuality } from './profile-cursos-quality'

const curso: Curso = {
  sequencial: 1,
  curso: {
    no_curso: 'MEDICINA',
    no_grau_academico: 'BACHARELADO',
    no_modalidade_ensino: 'PRESENCIAL',
    in_gratuito: false,
    cine: {},
  },
  instituicao: { co_ies: '1' },
  localizacao: {
    no_municipio: 'BELO HORIZONTE',
    sg_uf: 'MG',
    in_capital: true,
  },
  censo_metricas: { qt_vg_total: 252, qt_vg_total_diurno: 252 },
  enade: { ano_enade: 2023, conceito_faixa_enade: '4' },
  tda: { tda: 25.6, nu_ano_ingresso_tda: 2020, nu_ano_referencia_tda: 2024 },
  sisu: { tem_sisu: false, ofertas: [] },
}

describe('ProfileCursosQuality', () => {
  it('shows the Enade grade, its cycle year and the source', () => {
    render(<ProfileCursosQuality curso={curso} />)

    expect(
      screen.getByRole('img', { name: 'Conceito Enade 4 de 5' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('Fonte: Inep · Enade 2023')).toBeInTheDocument()
  })

  it('shows the accumulated dropout rate from the TDA data', () => {
    render(<ProfileCursosQuality curso={curso} />)

    expect(screen.getByText(/Este curso:/)).toHaveTextContent('25,6%')
  })

  it('describes a course without an Enade evaluation', () => {
    render(<ProfileCursosQuality curso={{ ...curso, enade: {} }} />)

    expect(
      screen.getByRole('img', { name: 'Sem avaliação no ciclo' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Fonte: Inep · Enade —')).toBeInTheDocument()
  })

  it('shows a placeholder dropout rate when there is no TDA data', () => {
    render(<ProfileCursosQuality curso={{ ...curso, tda: {} }} />)

    expect(screen.queryByText(/%$/)).not.toBeInTheDocument()
  })

  it('carries the module on the root so the accent is inherited', () => {
    const { container } = render(
      <ProfileCursosQuality curso={curso} module="2" />,
    )

    expect(container.firstChild).toHaveAttribute('data-module', '2')
  })
})
