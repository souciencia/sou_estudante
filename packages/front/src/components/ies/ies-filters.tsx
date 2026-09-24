'use client'

import { useSearchParams } from 'next/navigation'
import {
  type FilterOptionDefinition,
  type FilterSectionDefinition,
  FiltersPanel,
} from '@/components/filters-panel/filters-panel'
import type { Module } from '@/lib/module'
import { ufLabel } from '@/lib/uf'
import type { AggregationBucket } from '@/services/api/types'
import { useSearchIes } from '@/services/api/use-search-ies'

const CATEGORIAS: FilterOptionDefinition[] = [
  { label: 'Federal', value: 'Federal' },
  { label: 'Estadual', value: 'Estadual' },
  { label: 'Municipal', value: 'Municipal' },
  { label: 'Privada', value: 'Privada' },
]

/** Constrói opções de filtro a partir das agregações (chaves reais do índice). */
function bucketsToOptions(
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

interface IesFiltersProps {
  module?: Module
  className?: string
}

export function IesFilters({ module, className }: IesFiltersProps) {
  const searchParams = useSearchParams()
  const { updateParams, aggregations } = useSearchIes()

  const getActiveValues = (key: string): string[] => {
    const raw = searchParams?.get(key)
    if (!raw) return []
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const handleToggle = (key: string, value: string) => {
    const activeValues = getActiveValues(key)
    const exists = activeValues.includes(value)
    const newValues = exists
      ? activeValues.filter((v) => v !== value)
      : [...activeValues, value]

    updateParams({
      [key]: newValues.length > 0 ? newValues.join(',') : null,
      page: '1',
    })
  }

  const sections: FilterSectionDefinition[] = [
    {
      key: 'uf',
      title: 'Estado',
      aggregationKey: 'ufs',
      options: bucketsToOptions(aggregations?.ufs, ufLabel),
    },
    {
      key: 'regiao',
      title: 'Região',
      aggregationKey: 'regioes',
      options: bucketsToOptions(aggregations?.regioes),
    },
    {
      key: 'categoria',
      title: 'Categoria',
      aggregationKey: 'categorias',
      options: CATEGORIAS,
    },
    {
      key: 'organizacao',
      title: 'Organização acadêmica',
      aggregationKey: 'organizacoes',
      options: bucketsToOptions(aggregations?.organizacoes),
    },
  ]

  return (
    <FiltersPanel
      sections={sections}
      aggregations={aggregations}
      activeValues={getActiveValues}
      onToggle={handleToggle}
      module={module}
      className={className}
    />
  )
}
