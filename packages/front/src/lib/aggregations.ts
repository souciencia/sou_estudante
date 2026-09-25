import type { AggregationsMap } from '@/services/api/types'

/**
 * Normaliza rótulos para comparação: remove acentos, caixa e espaços das bordas.
 */
export function normalizeLabel(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

/**
 * Busca a contagem de uma opção de filtro nas agregações da API.
 * Retorna `undefined` quando o grupo não existe e `0` quando não há match.
 */
export function getAggregationCount(
  aggregations: AggregationsMap | null | undefined,
  group: string,
  matchValue: string,
): number | undefined {
  const buckets = aggregations?.[group]
  if (!buckets) return undefined

  const normMatch = normalizeLabel(matchValue)
  const bucket = buckets.find((b) => {
    const normKey = normalizeLabel(b.key)
    return (
      normKey === normMatch ||
      normKey.includes(normMatch) ||
      normMatch.includes(normKey)
    )
  })

  return bucket ? bucket.count : 0
}
