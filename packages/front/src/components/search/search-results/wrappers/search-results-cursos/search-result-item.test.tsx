import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Curso } from '@/services/api/types'
import { SearchResultItem } from './search-result-item'

const buildCurso = (temSisu: boolean): Curso => ({
  sequencial: 101,
  curso: {
    co_curso: '123',
    no_curso: 'Ciência da Computação',
    no_grau_academico: 'Bacharelado',
    in_gratuito: true,
    cine: {},
  },
  instituicao: { co_ies: '1', no_ies: 'UFMG', sg_ies: 'UFMG' },
  localizacao: {
    no_municipio: 'Belo Horizonte',
    sg_uf: 'MG',
    in_capital: true,
  },
  censo_metricas: {},
  enade: {},
  tda: {},
  sisu: { tem_sisu: temSisu, ofertas: [] },
})

describe('SearchResultItem', () => {
  it('links to the course profile', () => {
    render(<SearchResultItem curso={buildCurso(false)} />)

    expect(
      screen.getByRole('link', { name: /Ciência da Computação/ }),
    ).toHaveAttribute('href', '/cursos/101')
  })

  it('links to the ingresso profile when originating from ingresso', () => {
    render(<SearchResultItem curso={buildCurso(false)} to="ingresso" />)

    expect(
      screen.getByRole('link', { name: /Ciência da Computação/ }),
    ).toHaveAttribute('href', '/ingresso/101')
  })

  it('links to the permanencia profile when originating from permanencia', () => {
    render(<SearchResultItem curso={buildCurso(false)} to="permanencia" />)

    expect(
      screen.getByRole('link', { name: /Ciência da Computação/ }),
    ).toHaveAttribute('href', '/permanencia/101')
  })

  it('hides the Sisu link when the card already points to ingresso', () => {
    render(<SearchResultItem curso={buildCurso(true)} to="ingresso" />)

    expect(
      screen.queryByRole('link', { name: /Ver ingresso pelo Sisu/ }),
    ).not.toBeInTheDocument()
  })

  it('shows a link to the Sisu admission profile when the course has Sisu', () => {
    render(<SearchResultItem curso={buildCurso(true)} />)

    expect(
      screen.getByRole('link', { name: /Ver ingresso pelo Sisu/ }),
    ).toHaveAttribute('href', '/ingresso/101')
  })

  it('does not show the Sisu link when the course has no Sisu', () => {
    render(<SearchResultItem curso={buildCurso(false)} />)

    expect(
      screen.queryByRole('link', { name: /Ver ingresso pelo Sisu/ }),
    ).not.toBeInTheDocument()
  })

  it('does not show the checkbox when not comparing', () => {
    render(<SearchResultItem curso={buildCurso(false)} />)

    expect(
      screen.queryByRole('checkbox', {
        name: /Comparar Ciência da Computação/,
      }),
    ).not.toBeInTheDocument()
  })

  it('shows the checkbox when comparing', () => {
    render(<SearchResultItem curso={buildCurso(false)} comparing />)

    expect(
      screen.getByRole('checkbox', { name: /Comparar Ciência da Computação/ }),
    ).toBeInTheDocument()
  })

  it('notifies the toggle with the course id when checked', () => {
    const onToggle = vi.fn()
    render(
      <SearchResultItem
        curso={buildCurso(false)}
        comparing
        onToggle={onToggle}
      />,
    )

    fireEvent.click(
      screen.getByRole('checkbox', { name: /Comparar Ciência da Computação/ }),
    )

    expect(onToggle).toHaveBeenCalledWith('101')
  })

  it('can disable the checkbox when the limit is reached', () => {
    render(<SearchResultItem curso={buildCurso(false)} comparing disabled />)

    expect(
      screen.getByRole('checkbox', { name: /Comparar Ciência da Computação/ }),
    ).toBeDisabled()
  })
})
