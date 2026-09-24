'use client'

import { ActiveFilters as ActiveFiltersBase } from '@/components/search/active-filters/active-filters'
import type { Module } from '@/lib/module'
import { ufLabel } from '@/lib/uf'
import { useSearchIes } from '@/services/api/use-search-ies'

const FILTER_KEYS = ['uf', 'regiao', 'categoria', 'organizacao', 'sort']

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

  return (
    <ActiveFiltersBase
      filterKeys={FILTER_KEYS}
      labelFor={labelFor}
      updateParams={updateParams}
      resetFilters={resetFilters}
      module={module}
      className={className}
    />
  )
}
