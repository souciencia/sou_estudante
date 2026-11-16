import type { AggregationBucket } from '@/services/api/types'
import type { FilterOptionDefinition } from './filters-panel'

/** Categorias administrativas das IES, compartilhadas pelos painéis de cursos e IES. */
export const CATEGORIAS_ADMINISTRATIVAS: FilterOptionDefinition[] = [
  { label: 'Pública federal', value: 'Pública Federal' },
  { label: 'Pública estadual', value: 'Pública Estadual' },
  { label: 'Pública municipal', value: 'Pública Municipal' },
  {
    label: 'Privada sem fins lucrativos',
    value: 'Privada Sem Fins Lucrativos',
  },
  {
    label: 'Privada com fins lucrativos',
    value: 'Privada Com Fins Lucrativos',
  },
]

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
