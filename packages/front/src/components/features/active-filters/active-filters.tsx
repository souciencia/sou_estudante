'use client'

import { X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Typo } from '@/components/atoms/typo'
import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { cn } from '@/utils/cn'

interface ActiveFilterItem {
  key: string
  value: string
  label: string
}

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

  const activeFilters: ActiveFilterItem[] = []

  for (const key of FILTER_KEYS) {
    const raw = searchParams.get(key)
    if (!raw) continue

    const values = raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    for (const value of values) {
      activeFilters.push({
        key,
        value,
        label: value,
      })
    }
  }

  if (activeFilters.length === 0) {
    return null
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
    <section
      data-module={module}
      className={cn(
        'flex flex-wrap items-center gap-2 py-2 font-coadjuvant text-fg-coadjuvant',
        className,
      )}
      aria-label="Filtros ativos"
    >
      <Typo v="mute" s="sm" t="span">
        Filtros aplicados:
      </Typo>

      {activeFilters.map((item) => (
        <span
          key={`${item.key}-${item.value}`}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-coadjuvant-sm font-medium text-accent-deep',
          )}
        >
          <Typo s="xs" t="span">
            {item.label}
          </Typo>
          <button
            type="button"
            onClick={() => handleRemove(item.key, item.value)}
            aria-label={`Remover filtro ${item.label}`}
            className={cn(
              'ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-accent-deep hover:bg-accent/20 focus:outline-none cursor-pointer',
            )}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={resetFilters}
        className={cn(
          'ml-2 text-coadjuvant-sm font-medium text-accent-deep hover:underline cursor-pointer',
        )}
      >
        <Typo s="xs" className="text-accent-deep">
          Limpar filtros
        </Typo>
      </button>
    </section>
  )
}
