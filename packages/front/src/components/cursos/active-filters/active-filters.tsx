'use client'

import { useSearchParams } from 'next/navigation'
import {
  type ActiveFilterChip,
  ActiveFiltersBar,
} from '@/components/search/active-filters-bar/active-filters-bar'
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

interface ActiveFiltersProps {
  module?: Module
  className?: string
}

export function ActiveFilters({ module, className }: ActiveFiltersProps) {
  const searchParams = useSearchParams()
  const { updateParams, resetFilters } = useSearchCursos()

  if (!searchParams) return null

  const filters: ActiveFilterChip[] = []

  for (const key of FILTER_KEYS) {
    const raw = searchParams.get(key)
    if (!raw) continue

    const values = raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    for (const value of values) {
      filters.push({
        key,
        value,
        label: value,
      })
    }
  }

  const handleRemove = (key: string, valueToRemove: string) => {
    const raw = searchParams.get(key)
    if (!raw) return

    const remaining = raw
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v !== valueToRemove && Boolean(v))

    updateParams({
      [key]: remaining.length > 0 ? remaining.join(',') : null,
      page: '1',
    })
  }

  return (
    <ActiveFiltersBar
      filters={filters}
      onRemove={handleRemove}
      onClear={resetFilters}
      module={module}
      className={className}
    />
  )
}
