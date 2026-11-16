'use client'

import { FilterGroup } from '@/components/search/filter-group'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

export interface SortOption {
  label: string
  value: string
}

export interface SortingOptionsProps {
  options: SortOption[]
  onSelect: (value: string) => void
  /** Valor da ordenação ativa; usado para marcar o botão correspondente. */
  value?: string
  /** Título do grupo de ordenação. */
  title?: string
  module?: Module
  className?: string
}

/**
 * Grupo de botões de ordenação agnóstico: recebe as opções, o valor ativo e o
 * callback, sem conhecer o endpoint de busca. Usa `FilterGroup`/`FilterGroupOption`
 * para padronizar o visual com as seções de filtro.
 */
export function SortingOptions({
  options,
  onSelect,
  value,
  title = 'Ordenação',
  module,
  className,
}: SortingOptionsProps) {
  return (
    <FilterGroup module={module} className={cn('w-full', className)}>
      <FilterGroup.Title>{title}</FilterGroup.Title>
      <FilterGroup.List>
        {options.map((option) => (
          <FilterGroup.Option
            key={option.value}
            type="radio"
            label={option.label}
            checked={option.value === value}
            onChange={() => onSelect(option.value)}
          />
        ))}
      </FilterGroup.List>
    </FilterGroup>
  )
}
