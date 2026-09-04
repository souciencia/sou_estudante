'use client'

import { X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Typo } from '@/components/atoms/typo'
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
  className?: string
}

export function ActiveFilters({ className }: ActiveFiltersProps) {
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
      className={cn('flex flex-wrap items-center gap-2 py-2', className)}
      aria-label="Filtros ativos"
    >
      <Typo v="mute" s="sm" t="span">
        Filtros aplicados:
      </Typo>

      {activeFilters.map((item) => (
        <span
          key={`${item.key}-${item.value}`}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800',
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
              'ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:outline-none cursor-pointer',
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
          'ml-2 text-xs font-medium text-red-600 hover:underline cursor-pointer',
        )}
      >
        <Typo s="xs" className="text-red-600">
          Limpar filtros
        </Typo>
      </button>
    </section>
  )
}
