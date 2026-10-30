import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Curso } from '@/services/api/types'
import { ProfileCursos } from './profile-cursos'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
  useParams: () => ({
    id: '1',
  }),
}))

vi.mock('@/components/compare/compare-provider', () => ({
  MAX_COMPARE: 4,
  useCompareCursos: () => ({
    ids: [],
    isComparing: false,
    isSelected: vi.fn(() => false),
    toggle: vi.fn(),
    setComparing: vi.fn(),
  }),
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
    expect(screen.getByText('Privada com fins lucrativos')).toBeInTheDocument()
  })

  it('switches to the quality tab', () => {
    render(<ProfileCursos curso={curso} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Qualidade' }))

    expect(screen.getByText('Ciclo avaliativo')).toBeInTheDocument()
    expect(screen.getByText(/Desistência acumulada/)).toBeInTheDocument()
  })

  it('links to the Sisu admission profile when the course has Sisu', () => {
    render(
      <ProfileCursos
        curso={{ ...curso, sisu: { tem_sisu: true, ofertas: [] } }}
      />,
    )

    expect(
      screen.getByRole('link', { name: /Como ingressar neste curso/ }),
    ).toHaveAttribute('href', '/ingresso/1')
  })

  it('does not link to the Sisu admission profile when the course has no Sisu', () => {
    render(<ProfileCursos curso={curso} />)

    expect(
      screen.queryByRole('link', { name: /Como ingressar neste curso/ }),
    ).not.toBeInTheDocument()
  })

  it('links to the permanence profile of the course', () => {
    render(<ProfileCursos curso={curso} />)

    expect(
      screen.getByRole('link', { name: /Vou conseguir me manter/ }),
    ).toHaveAttribute('href', '/permanencia/1')
  })
})
