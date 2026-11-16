import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Curso } from '@/services/api/types'
import { ProfilePermanencia } from './profile-permanencia'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}))

const curso: Curso = {
  sequencial: 1,
  curso: {
    no_curso: 'MEDICINA',
    no_grau_academico: 'BACHARELADO',
    in_gratuito: false,
    cine: {},
  },
  instituicao: {
    co_ies: '1',
    sg_ies: 'UNI-BH',
    no_ies: 'Universidade de Exemplo',
    categoria_administrativa: 'Privada com fins lucrativos',
  },
  localizacao: {
    no_municipio: 'BELO HORIZONTE',
    sg_uf: 'MG',
    in_capital: true,
  },
  censo_metricas: {
    qt_ing: 100,
    qt_mat: 400,
    qt_mat_apoio_social: 40,
    qt_ativ_extracurricular: 120,
    qt_ing_prounii: 10,
    qt_ing_prounip: 15,
    qt_ing_fies: 8,
    qt_ing_reserva_vaga: 50,
  },
  enade: { ano_enade: 2023, conceito_faixa_enade: '2' },
  tda: { tda: 25.6, nu_ano_ingresso_tda: 2020, nu_ano_referencia_tda: 2024 },
  sisu: { tem_sisu: false, ofertas: [] },
}

describe('ProfilePermanencia', () => {
  it('renders the profile with data', () => {
    render(<ProfilePermanencia curso={curso} />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'MEDICINA — BACHARELADO',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Universidade de Exemplo · BELO HORIZONTE · MG'),
    ).toBeInTheDocument()

    expect(screen.getByText('Privada com fins lucrativos')).toBeInTheDocument()
  })

  it('renders the permanence support indicators', () => {
    render(<ProfilePermanencia curso={curso} />)

    expect(screen.getByText('Apoio Social')).toBeInTheDocument()
    expect(screen.getByText('Atividade extracurricular')).toBeInTheDocument()
  })

  it('renders ProUni and Fies for paid courses', () => {
    render(<ProfilePermanencia curso={curso} />)

    expect(screen.getByText('Bolsas e financiamento')).toBeInTheDocument()
    expect(screen.getByText('Financiamento é dívida.')).toBeInTheDocument()
  })

  it('does not render financing section for free courses', () => {
    const cursoGratuito = {
      ...curso,
      curso: {
        ...curso.curso,
        in_gratuito: true,
      },
    }

    render(<ProfilePermanencia curso={cursoGratuito} />)

    expect(screen.queryByText('Bolsas e financiamento')).not.toBeInTheDocument()

    expect(
      screen.queryByText('Financiamento é dívida.'),
    ).not.toBeInTheDocument()
  })

  it('renders the quotas section', () => {
    render(<ProfilePermanencia curso={curso} />)

    expect(screen.getByText('Reserva de vagas · cotas')).toBeInTheDocument()
  })

  it('renders the institution route', () => {
    render(<ProfilePermanencia curso={curso} />)

    expect(screen.getByText('Conheça a instituição')).toBeInTheDocument()
  })
})
