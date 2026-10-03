import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Curso } from '@/services/api'
import { ProfileIngresso } from './profile-ingresso'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}))

const mockCurso: Curso = {
  curso: {
    no_curso: 'Medicina',
    no_grau_academico: 'Bacharelado',
    in_gratuito: false,
    cine: undefined,
  },
  instituicao: {
    no_ies: 'Universidade Federal do Rio de Janeiro',
    sg_ies: 'UFRJ',
  },
  localizacao: {
    no_municipio: 'Rio de Janeiro',
    sg_uf: 'RJ',
    in_capital: false,
  },
  sisu: {
    ofertas: [
      {
        municipio: '3304557',
        nome_municipio: 'RIO DE JANEIRO',
        turno: 'INTEGRAL',
        modalidade: 'AC',
        ordem_modalidade: 1,
        grupo: 'AC',
        descricao: 'Ampla concorrência',
        vagas: 80,
        nota_corte: 820.0,
        inscricoes: 2000,
      },
    ],
    tem_sisu: false,
  },
}

describe('ProfileIngresso Component', () => {
  it('deve renderizar corretamente o título, instituição e tags principais', () => {
    render(<ProfileIngresso curso={mockCurso} />)

    expect(screen.getByText(/Medicina — Bacharelado/i)).toBeInTheDocument()

    expect(
      screen.getByText(/Universidade Federal do Rio de Janeiro · UFRJ/i),
    ).toBeInTheDocument()

    expect(screen.getByText('Tem Sisu')).toBeInTheDocument()

    expect(screen.getByText('Rio de Janeiro, RJ')).toBeInTheDocument()
  })
})
