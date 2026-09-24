'use client'

import { X } from 'lucide-react'
import { Typo } from '@/components/typo'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

export interface ActiveFilterChip {
  key: string
  value: string
  label: string
}

export interface ActiveFiltersBarProps {
  filters: ActiveFilterChip[]
  onRemove: (key: string, value: string) => void
  onClear: () => void
  module?: Module
  className?: string
}

/**
 * Barra de filtros ativos agnóstica: recebe os chips já calculados e os
 * callbacks de remoção/limpeza. Não conhece o domínio dos filtros.
 */
export function ActiveFiltersBar({
  filters,
  onRemove,
  onClear,
  module,
  className,
}: ActiveFiltersBarProps) {
  if (filters.length === 0) {
    return null
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

      {filters.map((item) => (
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
            onClick={() => onRemove(item.key, item.value)}
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
        onClick={onClear}
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
