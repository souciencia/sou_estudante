import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Curso } from '@/services/api/types'
import { ProfileCursos } from './profile-cursos'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}))

const curso: Curso = {
  sequencial: 1,
  curso: {
    no_curso: 'MEDICINA',
    no_grau_academico: 'BACHARELADO',
    no_modalidade_ensino: 'PRESENCIAL',
    in_gratuito: false,
    cine: {},
  },
  instituicao: {
    co_ies: '1',
    sg_ies: 'UNI-BH',
    categoria_administrativa: 'Privada com fins lucrativos',
  },
  localizacao: {
    no_municipio: 'BELO HORIZONTE',
    sg_uf: 'MG',
    in_capital: true,
  },
  censo_metricas: { qt_vg_total: 252, qt_vg_total_diurno: 252 },
  enade: { ano_enade: 2023, conceito_faixa_enade: '2' },
  tda: { tda: 25.6, nu_ano_ingresso_tda: 2020, nu_ano_referencia_tda: 2024 },
  sisu: { tem_sisu: false, ofertas: [] },
}

describe('ProfileCursos', () => {
  it('renders the course profile with overview data', () => {
    render(<ProfileCursos curso={curso} />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'MEDICINA — BACHARELADO',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Escolher curso' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Privada com fins lucrativos')).toBeInTheDocument()
  })

  it('switches to the quality tab', () => {
    render(<ProfileCursos curso={curso} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Qualidade' }))

    expect(screen.getByText('Ciclo avaliativo')).toBeInTheDocument()
    expect(screen.getByText(/Desistência acumulada/)).toBeInTheDocument()
  })
})
