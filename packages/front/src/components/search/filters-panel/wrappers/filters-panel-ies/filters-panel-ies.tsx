'use client'

import {
  buildFilterOptions,
  CATEGORIAS_ADMINISTRATIVAS,
} from '@/components/search/filters-panel/filters-helpers'
import {
  type FilterSectionDefinition,
  FiltersPanel,
} from '@/components/search/filters-panel/filters-panel'
import { useFilterPanel } from '@/components/search/filters-panel/use-filter-panel'
import { SortingOptionsIes } from '@/components/search/sorting-options/wrappers/sorting-options-ies/sorting-options-ies'
import type { Module } from '@/lib/module'
import { ufOptions } from '@/lib/uf'
import { useSearchIes } from '@/services/api/use-search-ies'

interface FiltersPanelIesProps {
  module?: Module
  className?: string
}

export function FiltersPanelIes({ module, className }: FiltersPanelIesProps) {
  const { updateParams, aggregations, resetFilters } = useSearchIes()
  const { getActiveValues, toggle, apply } = useFilterPanel(updateParams)

  const sections: FilterSectionDefinition[] = [
    {
      key: 'uf',
      title: 'Estado',
      aggregationKey: 'ufs',
      options: ufOptions(),
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
      options: CATEGORIAS_ADMINISTRATIVAS,
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
      onApply={apply}
      onClear={resetFilters}
      leading={<SortingOptionsIes module={module} />}
      module={module}
      className={className}
    />
  )
}
