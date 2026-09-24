'use client'

import { useSearchParams } from 'next/navigation'
import {
  type ActiveFilterChip,
  ActiveFiltersBar,
} from '@/components/search/active-filters-bar/active-filters-bar'
import type { Module } from '@/lib/module'
import { ufLabel } from '@/lib/uf'
import { useSearchIes } from '@/services/api/use-search-ies'

const FILTER_KEYS = ['uf', 'regiao', 'categoria', 'organizacao', 'sort']

const SORT_LABELS: Record<string, string> = {
  az: 'A Z',
  relevancia: 'Relevância',
}

function chipLabel(key: string, value: string): string {
  if (key === 'uf') return ufLabel(value)
  if (key === 'sort') return SORT_LABELS[value] ?? value
  return value
}

interface IesActiveFiltersProps {
  module?: Module
  className?: string
}

export function IesActiveFilters({ module, className }: IesActiveFiltersProps) {
  const searchParams = useSearchParams()
  const { updateParams, resetFilters } = useSearchIes()

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
      filters.push({ key, value, label: chipLabel(key, value) })
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
