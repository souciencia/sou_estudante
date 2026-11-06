import { describe, expect, it } from 'vitest'
import type { Curso } from '@/services/api/types'
import { buildCompareSections } from './compare-rows'

const buildCurso = (overrides: Partial<Curso> = {}): Curso => ({
  sequencial: 101,
  instituicao: { no_ies: 'UFMG', sg_ies: 'UFMG' },
  curso: {
    no_curso: 'Ciência da Computação',
    no_grau_academico: 'Bacharelado',
    no_modalidade_ensino: 'Presencial',
    in_gratuito: true,
    cine: {},
  },
  localizacao: {
    no_municipio: 'Belo Horizonte',
    sg_uf: 'MG',
    in_capital: true,
  },
  censo_metricas: { qt_vg_total: 120, qt_mat: 480 },
  enade: { conceito_faixa_enade: '4', ano_enade: 2023 },
  tda: { tda: 51.2, nu_ano_referencia_tda: 2024 },
  sisu: {
    tem_sisu: true,
    ofertas: [{ nota_corte: 700.5, vagas: 40, turno: 'Integral' }],
  },
  ...overrides,
})

describe('buildCompareSections', () => {
  it('deriva um valor por coluna para cada linha', () => {
    const sections = buildCompareSections([buildCurso(), buildCurso()])

    const identidade = sections[0]
    const instituicao = identidade.rows.find(
      (row) => row.label === 'Instituição',
    )

    expect(instituicao?.values).toEqual(['UFMG', 'UFMG'])
  })

  it('formata o conceito Enade, a taxa de desistência e a gratuidade', () => {
    const sections = buildCompareSections([buildCurso()])

    const labels: Record<string, string | undefined> = {}
    for (const section of sections) {
      for (const row of section.rows) {
        labels[row.label] = row.values[0]
      }
    }

    expect(labels['Conceito Enade']).toBe('Nota 4')
    expect(labels['Taxa de desistência']).toBe('51%')
    expect(labels.Gratuidade).toBe('Gratuito')
    expect(labels['Oferta no Sisu']).toBe('Sim')
  })

  it('marca "SC" como sem conceito', () => {
    const sections = buildCompareSections([
      buildCurso({ enade: { conceito_faixa_enade: 'SC' } }),
    ])

    const qualidade = sections.find((section) => section.title === 'Qualidade')
    const conceito = qualidade?.rows.find(
      (row) => row.label === 'Conceito Enade',
    )

    expect(conceito?.values[0]).toBe('Sem conceito')
  })

  it('vira célula indefinida para curso não encontrado', () => {
    const sections = buildCompareSections([null])

    const identidade = sections[0]
    const instituicao = identidade.rows.find(
      (row) => row.label === 'Instituição',
    )

    expect(instituicao?.values[0]).toBeUndefined()
  })

  it('renomeia a seção de ingresso para "Ingresso"', () => {
    const sections = buildCompareSections([buildCurso()])

    const ingresso = sections.find((section) => section.title === 'Ingresso')

    expect(ingresso?.source).toBe('Sisu')
    expect(
      sections.some((section) => section.title === 'Ingresso pelo Sisu'),
    ).toBe(false)
  })

  it('lista as modalidades de cota com a nota de corte correspondente', () => {
    const sections = buildCompareSections([
      buildCurso({
        sisu: {
          tem_sisu: true,
          ofertas: [
            { modalidade: 'AC', nota_corte: 700.5 },
            { modalidade: 'LB_PPI', nota_corte: 680.2 },
            { modalidade: 'LI_Q', nota_corte: 690 },
          ],
        },
      }),
    ])

    const cotas = sections.find(
      (section) => section.title === 'Por modalidade de cota',
    )

    expect(cotas?.source).toBe('1ª chamada')
    expect(cotas?.plainLabels).toBe(true)
    expect(cotas?.rows.map((row) => row.label)).toEqual([
      'Baixa renda · demais candidatos',
      'Baixa renda · pessoas com deficiência',
      'Baixa renda · pretos, pardos e indígenas',
      'Baixa renda · quilombolas',
      'Independente de renda · demais candidatos',
      'Independente de renda · pessoas com deficiência',
      'Independente de renda · pretos, pardos e indígenas',
      'Independente de renda · quilombolas',
      'Outras modalidades da instituição',
    ])

    const porLabel = Object.fromEntries(
      cotas?.rows.map((row) => [row.label, row.values[0]]) ?? [],
    )

    expect(porLabel['Baixa renda · pretos, pardos e indígenas']).toBe('680.2')
    expect(porLabel['Independente de renda · quilombolas']).toBe('690')
    expect(porLabel['Baixa renda · demais candidatos']).toBeUndefined()
  })

  it('marca "Sim" quando há modalidades próprias da instituição', () => {
    const sections = buildCompareSections([
      buildCurso({
        sisu: {
          tem_sisu: true,
          ofertas: [{ modalidade: 'BONUS_REGIONAL', nota_corte: 650 }],
        },
      }),
    ])

    const cotas = sections.find(
      (section) => section.title === 'Por modalidade de cota',
    )
    const outras = cotas?.rows.find(
      (row) => row.label === 'Outras modalidades da instituição',
    )

    expect(outras?.values[0]).toBe('Sim')
  })

  it('marca as linhas numéricas para renderização em fonte mono', () => {
    const sections = buildCompareSections([buildCurso()])

    const linhas = new Map(
      sections.flatMap((section) =>
        section.rows.map((row) => [row.label, row.numeric]),
      ),
    )

    expect(linhas.get('Vagas por ano')).toBe(true)
    expect(linhas.get('Matrículas')).toBe(true)
    expect(linhas.get('Ano do Enade')).toBe(true)
    expect(linhas.get('Taxa de desistência')).toBe(true)
    expect(linhas.get('Nota de corte')).toBe(true)
    expect(linhas.get('Baixa renda · demais candidatos')).toBe(true)

    expect(linhas.get('Instituição')).toBeUndefined()
    expect(linhas.get('Conceito Enade')).toBeUndefined()
    expect(linhas.get('Turno')).toBeUndefined()
    expect(linhas.get('Outras modalidades da instituição')).toBeUndefined()
  })

  it('preenche com "Não usa Sisu" quando o curso não tem Sisu', () => {
    const sections = buildCompareSections([
      buildCurso({ sisu: { tem_sisu: false, ofertas: [] } }),
    ])

    const labels: Record<string, string | undefined> = {}
    for (const section of sections) {
      for (const row of section.rows) {
        labels[row.label] = row.values[0]
      }
    }

    const NAO_USA_SISU = 'Não usa Sisu · verifique as cotas na instituição'

    expect(labels['Oferta no Sisu']).toBe(NAO_USA_SISU)
    expect(labels['Nota de corte']).toBe(NAO_USA_SISU)
    expect(labels['Vagas no Sisu']).toBe(NAO_USA_SISU)
    expect(labels.Turno).toBe(NAO_USA_SISU)
    expect(labels['Baixa renda · demais candidatos']).toBe(NAO_USA_SISU)
    expect(labels['Outras modalidades da instituição']).toBe(NAO_USA_SISU)
  })
})
