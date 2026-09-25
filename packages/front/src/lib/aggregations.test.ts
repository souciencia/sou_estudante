import { describe, expect, it } from 'vitest'
import { getAggregationCount, normalizeLabel } from './aggregations'

describe('normalizeLabel', () => {
  it('remove acentos, caixa e espaços das bordas', () => {
    expect(normalizeLabel('  São Paulo ')).toBe('SAO PAULO')
  })
})

describe('getAggregationCount', () => {
  it('encontra a contagem ignorando acentos e caixa', () => {
    const aggregations = {
      ufs: [{ key: 'SP', count: 323 }],
      graus: [{ key: 'BACHARELADO', count: 1860 }],
    }

    expect(getAggregationCount(aggregations, 'ufs', 'SP')).toBe(323)
    expect(getAggregationCount(aggregations, 'graus', 'Bacharelado')).toBe(1860)
  })

  it('retorna 0 quando o grupo existe mas não há bucket correspondente', () => {
    const aggregations = { ufs: [{ key: 'SP', count: 323 }] }

    expect(getAggregationCount(aggregations, 'ufs', 'RJ')).toBe(0)
  })

  it('retorna undefined quando o grupo não existe', () => {
    expect(getAggregationCount({}, 'ufs', 'SP')).toBeUndefined()
    expect(getAggregationCount(null, 'ufs', 'SP')).toBeUndefined()
  })
})
