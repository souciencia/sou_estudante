'use client'

import { useState } from 'react'
import { FilterGroup } from '@/components/filter-group'
import { Typo } from '@/components/typo'
import { getAggregationCount } from '@/lib/aggregations'
import type { Module } from '@/lib/module'
import type { AggregationsMap } from '@/services/api/types'
import { cn } from '@/utils/cn'

export interface FilterOptionDefinition {
  label: string
  value: string
}

export interface FilterSectionDefinition {
  /** Chave do parâmetro na URL (ex.: "uf"). */
  key: string
  title: string
  /** Chave do grupo nas agregações da API (ex.: "ufs"). */
  aggregationKey: string
  options: FilterOptionDefinition[]
  /** Quando definido, exibe apenas N opções até expandir. */
  visibleCount?: number
  /** Rótulo do botão de expandir (recebe a qtd. de opções ocultas). */
  moreLabel?: (hiddenCount: number) => string
  /** Rótulo do botão de recolher. */
  lessLabel?: string
}

export interface FiltersPanelProps {
  sections: FilterSectionDefinition[]
  aggregations?: AggregationsMap | null
  activeValues: (key: string) => string[]
  onToggle: (key: string, value: string) => void
  module?: Module
  className?: string
}

/**
 * Painel de filtros agnóstico: recebe a definição das seções, as agregações da
 * API e os callbacks de estado, sem conhecer o domínio (cursos, IES, ...).
 */
export function FiltersPanel({
  sections,
  aggregations,
  activeValues,
  onToggle,
  module,
  className,
}: FiltersPanelProps) {
  return (
    <div
      data-module={module}
      className={cn(
        'flex flex-col gap-6 font-coadjuvant text-fg-coadjuvant',
        className,
      )}
    >
      {sections.map((section) => (
        <FilterSection
          key={section.key}
          section={section}
          aggregations={aggregations}
          activeValues={activeValues}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

interface FilterSectionProps {
  section: FilterSectionDefinition
  aggregations?: AggregationsMap | null
  activeValues: (key: string) => string[]
  onToggle: (key: string, value: string) => void
}

function FilterSection({
  section,
  aggregations,
  activeValues,
  onToggle,
}: FilterSectionProps) {
  const [expanded, setExpanded] = useState(false)

  const { visibleCount } = section
  const hasMore =
    typeof visibleCount === 'number' && section.options.length > visibleCount
  const visibleOptions =
    hasMore && !expanded
      ? section.options.slice(0, visibleCount)
      : section.options
  const hiddenCount = hasMore ? section.options.length - (visibleCount ?? 0) : 0
  const active = activeValues(section.key)

  return (
    <FilterGroup>
      <FilterGroup.Title>{section.title}</FilterGroup.Title>
      <FilterGroup.List>
        {visibleOptions.map((item) => (
          <FilterGroup.Option
            key={item.value}
            label={item.label}
            value={item.value}
            resultCount={getAggregationCount(
              aggregations,
              section.aggregationKey,
              item.value,
            )}
            checked={active.includes(item.value)}
            onChange={() => onToggle(section.key, item.value)}
          />
        ))}
      </FilterGroup.List>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            'mt-2 text-left text-coadjuvant text-accent-deep hover:underline cursor-pointer',
          )}
        >
          <Typo s="sm" className={cn('text-accent-deep')}>
            {expanded
              ? (section.lessLabel ?? 'Ver menos')
              : (section.moreLabel?.(hiddenCount) ?? `+ ${hiddenCount}`)}
          </Typo>
        </button>
      )}
    </FilterGroup>
  )
}
