'use client'

import { useSearchParams } from 'next/navigation'
import {
  type ActiveFilterChip,
  ActiveFiltersBar,
} from '@/components/search/active-filters-bar/active-filters-bar'
import type { Module } from '@/lib/module'

export interface ActiveFiltersProps {
  /** Chaves de query que viram chips (ex.: ['uf', 'turno']). */
  filterKeys: readonly string[]
  /** Converte chave/valor em rótulo legível (ex.: uf -> nome do estado). */
  labelFor?: (key: string, value: string) => string
  updateParams: (params: Record<string, string | null>) => void
  resetFilters: () => void
  module?: Module
  className?: string
}

/**
 * Filtros ativos agnóstico: lê as chaves da URL, monta os chips e trata
 * remoção/limpeza. O domínio (cursos, IES) entra só via `filterKeys`/`labelFor`.
 */
export function ActiveFilters({
  filterKeys,
  labelFor,
  updateParams,
  resetFilters,
  module,
  className,
}: ActiveFiltersProps) {
  const searchParams = useSearchParams()

  if (!searchParams) return null

  const filters: ActiveFilterChip[] = []

  for (const key of filterKeys) {
    const raw = searchParams.get(key)
    if (!raw) continue

    const values = raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    for (const value of values) {
      filters.push({
        key,
        value,
        label: labelFor ? labelFor(key, value) : value,
      })
    }
  }

  const handleRemove = (key: string, valueToRemove: string) => {
    const raw = searchParams.get(key)
    if (!raw) return

    const remaining = raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value !== valueToRemove && Boolean(value))

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
