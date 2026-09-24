'use client'

import { ActiveFilters as ActiveFiltersBase } from '@/components/search/active-filters/active-filters'
import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'

const FILTER_KEYS = [
  'uf',
  'turno',
  'grau',
  'categoria',
  'modalidade',
  'enade',
  'sort',
]

interface ActiveFiltersCursosProps {
  module?: Module
  className?: string
}

export function ActiveFiltersCursos({
  module,
  className,
}: ActiveFiltersCursosProps) {
  const { updateParams, resetFilters } = useSearchCursos()

  return (
    <ActiveFiltersBase
      filterKeys={FILTER_KEYS}
      updateParams={updateParams}
      resetFilters={resetFilters}
      module={module}
      className={className}
    />
  )
}
