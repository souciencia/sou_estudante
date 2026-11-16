'use client'

import {
  buildFilterOptions,
  CATEGORIAS_ADMINISTRATIVAS,
} from '@/components/search/filters-panel/filters-helpers'
import {
  type FilterSectionDefinition,
  FiltersPanel,
} from '@/components/search/filters-panel/filters-panel'
import { useMunicipioFilterPanel } from '@/components/search/filters-panel/use-municipio-filter-panel'
import { MunicipioFilters } from '@/components/search/municipio-filter/municipio-filters'
import { SortingOptionsIes } from '@/components/search/sorting-options/wrappers/sorting-options-ies/sorting-options-ies'
import type { Module } from '@/lib/module'
import { ufOptions } from '@/lib/uf'
import { useMunicipios } from '@/services/api/use-municipios'
import { useSearchIes } from '@/services/api/use-search-ies'

interface FiltersPanelIesProps {
  module?: Module
  className?: string
}

export function FiltersPanelIes({ module, className }: FiltersPanelIesProps) {
  const { updateParams, aggregations, resetFilters } = useSearchIes()
  const { municipios } = useMunicipios()
  const { getActiveValues, onToggle, onApply } = useMunicipioFilterPanel(
    updateParams,
    municipios,
  )
  const availableCodigos = aggregations?.municipios
    ? new Set(aggregations.municipios.map((bucket) => bucket.key))
    : undefined

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
      onToggle={onToggle}
      onApply={onApply}
      onClear={resetFilters}
      leading={<SortingOptionsIes module={module} />}
      afterSection={(section, ctx) =>
        section.key === 'uf' ? (
          <MunicipioFilters
            ufs={ctx.activeValues('uf')}
            municipios={municipios}
            selected={ctx.activeValues('municipio')}
            onToggle={(codigo) => ctx.onToggle('municipio', codigo)}
            availableCodigos={availableCodigos}
            module={module}
          />
        ) : null
      }
      module={module}
      className={className}
    />
  )
}
