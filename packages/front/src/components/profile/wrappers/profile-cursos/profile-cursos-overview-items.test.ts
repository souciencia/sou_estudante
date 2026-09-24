import { describe, expect, it } from 'vitest'
import type { Curso } from '@/services/api/types'
import { buildOverviewItems } from './profile-cursos-overview-items'

const makeCurso = (overrides: Partial<Curso> = {}): Curso => ({
  curso: {
    no_curso: 'MEDICINA',
    no_grau_academico: 'BACHARELADO',
    no_modalidade_ensino: 'PRESENCIAL',
    in_gratuito: false,
    cine: {},
  },
  instituicao: {
    co_ies: '1',
    categoria_administrativa: 'Privada com fins lucrativos',
  },
  localizacao: {
    no_municipio: 'BELO HORIZONTE',
    sg_uf: 'MG',
    in_capital: true,
  },
  censo_metricas: { qt_vg_total: 252, qt_vg_total_diurno: 252 },
  enade: {},
  tda: {},
  sisu: { tem_sisu: false, ofertas: [] },
  ...overrides,
})

const byLabel = (items: ReturnType<typeof buildOverviewItems>, label: string) =>
  items.find((item) => item.label === label)

describe('buildOverviewItems', () => {
  it('describes the degree and the paid category', () => {
    const items = buildOverviewItems(makeCurso())

    expect(byLabel(items, 'Grau')?.value).toBe('BACHARELADO')
    expect(byLabel(items, 'Categoria')?.value).toBe(
      'Privada com fins lucrativos',
    )
    expect(byLabel(items, 'Tem mensalidade?')?.value).toBe('Sim')
  })

  it('derives the shift from the censo vacancies', () => {
    const items = buildOverviewItems(
      makeCurso({ censo_metricas: { qt_vg_total_diurno: 100 } }),
    )

    expect(byLabel(items, 'Turno')?.value).toBe('Diurno')
    expect(byLabel(items, 'Turno')?.note).toBe('com vagas · Censo')
  })

  it('shows the yearly vacancies from the censo', () => {
    const items = buildOverviewItems(makeCurso())

    expect(byLabel(items, 'Vagas/ano')?.value).toBe('252')
    expect(byLabel(items, 'Vagas/ano')?.note).toBe('Censo')
  })

  it('marks a free course as having no tuition', () => {
    const items = buildOverviewItems(
      makeCurso({
        curso: {
          no_curso: 'DIREITO',
          in_gratuito: true,
          cine: {},
        },
      }),
    )

    expect(byLabel(items, 'Tem mensalidade?')?.value).toBe('Não')
  })
})
