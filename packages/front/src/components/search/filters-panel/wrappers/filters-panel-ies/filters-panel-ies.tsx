'use client'

import { buildFilterOptions } from '@/components/search/filters-panel/filters-helpers'
import {
  type FilterOptionDefinition,
  type FilterSectionDefinition,
  FiltersPanel,
} from '@/components/search/filters-panel/filters-panel'
import { useFilterPanel } from '@/components/search/filters-panel/use-filter-panel'
import type { Module } from '@/lib/module'
import { ufLabel } from '@/lib/uf'
import { useSearchIes } from '@/services/api/use-search-ies'

const CATEGORIAS: FilterOptionDefinition[] = [
  { label: 'Federal', value: 'Federal' },
  { label: 'Estadual', value: 'Estadual' },
  { label: 'Municipal', value: 'Municipal' },
  { label: 'Privada', value: 'Privada' },
]

interface FiltersPanelIesProps {
  module?: Module
  className?: string
}

export function FiltersPanelIes({ module, className }: FiltersPanelIesProps) {
  const { updateParams, aggregations } = useSearchIes()
  const { getActiveValues, toggle } = useFilterPanel(updateParams)

  const sections: FilterSectionDefinition[] = [
    {
      key: 'uf',
      title: 'Estado',
      aggregationKey: 'ufs',
      options: buildFilterOptions(aggregations?.ufs, ufLabel),
    },
    {
      key: 'regiao',
      title: 'Região',
      aggregationKey: 'regioes',
      options: buildFilterOptions(aggregations?.regioes),
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
      options: buildFilterOptions(aggregations?.organizacoes),
    },
  ]

  return (
    <FiltersPanel
      sections={sections}
      aggregations={aggregations}
      activeValues={getActiveValues}
      onToggle={toggle}
      module={module}
      className={className}
    />
  )
}
