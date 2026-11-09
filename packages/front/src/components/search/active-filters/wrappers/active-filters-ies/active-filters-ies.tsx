'use client'

import { ActiveFilters as ActiveFiltersBase } from '@/components/search/active-filters/active-filters'
import type { Module } from '@/lib/module'
import { municipioNome } from '@/lib/municipio'
import { ufLabel } from '@/lib/uf'
import { useMunicipios } from '@/services/api/use-municipios'
import { useSearchIes } from '@/services/api/use-search-ies'

const FILTER_KEYS = [
  'uf',
  'municipio',
  'regiao',
  'categoria',
  'organizacao',
  'sort',
]

const SORT_LABELS: Record<string, string> = {
  az: 'A Z',
  relevancia: 'Relevância',
}

function labelFor(key: string, value: string): string {
  if (key === 'uf') return ufLabel(value)
  if (key === 'sort') return SORT_LABELS[value] ?? value
  return value
}

interface ActiveFiltersIesProps {
  module?: Module
  className?: string
}

export function ActiveFiltersIes({ module, className }: ActiveFiltersIesProps) {
  const { updateParams, resetFilters } = useSearchIes()
  const { municipios } = useMunicipios()

  return (
    <ActiveFiltersBase
      filterKeys={FILTER_KEYS}
      labelFor={(key, value) =>
        key === 'municipio'
          ? (municipioNome(municipios, value) ?? value)
          : labelFor(key, value)
      }
      updateParams={updateParams}
      resetFilters={resetFilters}
      module={module}
      className={className}
    />
  )
}
