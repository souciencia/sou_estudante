import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { CompareProvider } from '@/components/compare/compare-provider'
import type { Curso } from '@/services/api/types'
import { SearchResultItem } from './search-result-item'

function renderItem(ui: ReactElement) {
  return render(<CompareProvider>{ui}</CompareProvider>)
}

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
    renderItem(<SearchResultItem curso={buildCurso(false)} />)

    expect(
      screen.getByRole('link', { name: /Ciência da Computação/ }),
    ).toHaveAttribute('href', '/cursos/101')
  })

  it('links to the ingresso profile when originating from ingresso', () => {
    renderItem(<SearchResultItem curso={buildCurso(false)} to="ingresso" />)

    expect(
      screen.getByRole('link', { name: /Ciência da Computação/ }),
    ).toHaveAttribute('href', '/ingresso/101')
  })

  it('links to the permanencia profile when originating from permanencia', () => {
    renderItem(<SearchResultItem curso={buildCurso(false)} to="permanencia" />)

    expect(
      screen.getByRole('link', { name: /Ciência da Computação/ }),
    ).toHaveAttribute('href', '/permanencia/101')
  })

  it('exibe a tag de vagas no Sisu quando o curso tem Sisu', () => {
    renderItem(<SearchResultItem curso={buildCurso(true)} />)

    expect(screen.getByText('Com vagas no Sisu')).toBeInTheDocument()
  })

  it('não exibe a tag de vagas no Sisu quando o curso não tem Sisu', () => {
    renderItem(<SearchResultItem curso={buildCurso(false)} />)

    expect(screen.queryByText('Com vagas no Sisu')).not.toBeInTheDocument()
  })

  it('does not duplicate the turno tag when it matches the modalidade', () => {
    const curso = buildCurso(true)
    curso.curso.no_modalidade_ensino = 'Ead'
    curso.sisu.ofertas = [{ turno: 'Ead' }]

    renderItem(<SearchResultItem curso={curso} />)

    expect(screen.getAllByText('Ead')).toHaveLength(1)
  })

  it('adiciona o curso à comparação ao clicar no link do rodapé', () => {
    renderItem(<SearchResultItem curso={buildCurso(false)} />)

    fireEvent.click(screen.getByRole('button', { name: 'Comparar' }))

    expect(
      screen.getByRole('button', { name: 'Adicionado à comparação' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('remove o curso da comparação ao clicar novamente no link', () => {
    renderItem(<SearchResultItem curso={buildCurso(false)} />)

    fireEvent.click(screen.getByRole('button', { name: 'Comparar' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionado à comparação' }),
    )

    expect(screen.getByRole('button', { name: 'Comparar' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
