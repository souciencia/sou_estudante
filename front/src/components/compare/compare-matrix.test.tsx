import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Curso } from '@/services/api/types'
import { CompareMatrix } from './compare-matrix'

const buildCurso = (): Curso => ({
  sequencial: 101,
  instituicao: { no_ies: 'UFMG' },
  curso: {
    no_curso: 'Ciência da Computação',
    in_gratuito: true,
    cine: {},
  },
  localizacao: { in_capital: true },
  censo_metricas: {},
  enade: {},
  tda: {},
  sisu: { tem_sisu: false, ofertas: [] },
})

describe('CompareMatrix', () => {
  it('renderiza uma coluna por curso com nome e instituição', () => {
    render(
      <CompareMatrix cursos={[buildCurso()]} onRemove={() => {}} module="5" />,
    )

    expect(screen.getByText('Ciência da Computação')).toBeInTheDocument()
    expect(screen.getAllByText('UFMG').length).toBeGreaterThan(0)
  })

  it('chama onRemove com o índice da coluna ao remover', () => {
    const onRemove = vi.fn()
    render(
      <CompareMatrix
        cursos={[buildCurso(), buildCurso()]}
        onRemove={onRemove}
      />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: /Remover/ })[1])

    expect(onRemove).toHaveBeenCalledWith(1)
  })

  it('mostra "Curso não encontrado" para coluna sem dados', () => {
    render(<CompareMatrix cursos={[null]} onRemove={() => {}} />)

    expect(screen.getByText('Curso não encontrado')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
