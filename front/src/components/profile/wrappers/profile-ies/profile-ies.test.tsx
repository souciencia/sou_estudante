import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileIES } from './profile-ies'

const iesMock = {
  co_ies: '376',
  no_ies: 'Universidade Federal De Mato Grosso',
  sg_ies: 'UFMT',
  categoria_administrativa: { no_categoria_administrativa: 'Pública Federal' },
  organizacao_academica: { no_organizacao_academica: 'Universidade' },
  localizacao: {
    no_municipio: 'Cuiabá',
    sg_uf: 'MT',
    no_regiao: 'Centro-Oeste',
    in_capital: true,
  },
  vagas_matriculas: {
    qt_mat: 15000,
  },
  docentes: {
    qt_cursos: 85,
    qt_doc_exe: 1200,
  },
}

describe('ProfileIES', () => {
  it('renders the header with title, subtitle and tags correctly', () => {
    render(<ProfileIES ies={iesMock} />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Universidade Federal De Mato Grosso',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('UFMT')).toBeInTheDocument()

    expect(screen.getByText('Universidade')).toBeInTheDocument()
    expect(screen.getByText('Pública Federal')).toBeInTheDocument()
  })

  it('renders section dividers and layout blocks', () => {
    render(<ProfileIES ies={iesMock} />)

    expect(screen.getByText(/panorama da instituição/i)).toBeInTheDocument()
    expect(
      screen.getByText(/corpo docente da instituição/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/continue sua rota/i)).toBeInTheDocument()
  })
})
