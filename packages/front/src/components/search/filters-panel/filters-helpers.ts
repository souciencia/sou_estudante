import type { AggregationBucket } from '@/services/api/types'
import type { FilterOptionDefinition } from './filters-panel'

/**
 * Constrói opções de filtro a partir das agregações da API, aplicando um
 * rótulo opcional e ordenando alfabeticamente.
 */
export function buildFilterOptions(
  buckets?: AggregationBucket[],
  labelFn?: (key: string) => string,
): FilterOptionDefinition[] {
  if (!buckets) return []
  return buckets
    .map((bucket) => ({
      label: labelFn ? labelFn(bucket.key) : bucket.key,
      value: bucket.key,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}
