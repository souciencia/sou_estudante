'use client'

import { Fragment, useState } from 'react'
import { FilterGroup } from '@/components/search/filter-group'
import { Typo } from '@/components/ui/typo'
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
  /** Limpa todos os filtros ativos. Sem ele, desmarca cada valor ativo. */
  onClear?: () => void
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
  onClear,
  module,
  className,
}: FiltersPanelProps) {
  const hasActiveFilters = sections.some(
    (section) => activeValues(section.key).length > 0,
  )

  const handleClear = () => {
    if (onClear) {
      onClear()
      return
    }

    for (const section of sections) {
      for (const value of activeValues(section.key)) {
        onToggle(section.key, value)
      }
    }
  }

  return (
    <div
      data-module={module}
      className={cn(
        'flex flex-col gap-6 rounded-card border border-card-border bg-card-surface p-6 font-coadjuvant text-fg-coadjuvant shadow-sm',
        className,
      )}
    >
      <header className="flex items-center justify-between">
        <Typo
          t="h2"
          s="sm"
          className={cn(
            'font-title-coadjuvant font-bold uppercase tracking-[0.14em] text-fg-protagonist',
          )}
        >
          Filtros
        </Typo>

        <button
          type="button"
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className={cn(
            'rounded-sm uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
            hasActiveFilters
              ? 'cursor-pointer text-accent-deep hover:underline'
              : 'cursor-not-allowed text-fg-muted',
          )}
        >
          <Typo s="sm">Limpar tudo</Typo>
        </button>
      </header>

      {sections.map((section, index) => (
        <Fragment key={section.key}>
          {index > 0 && (
            <hr className={cn('m-0 h-px w-full border-0 bg-card-border')} />
          )}
          <FilterSection
            section={section}
            aggregations={aggregations}
            activeValues={activeValues}
            onToggle={onToggle}
          />
        </Fragment>
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
    <FilterGroup className="w-full">
      <FilterGroup.Title>{section.title}</FilterGroup.Title>
      <FilterGroup.List>
        {visibleOptions.map((item) => {
          const resultCount = getAggregationCount(
            aggregations,
            section.aggregationKey,
            item.value,
          )
          const isActive = active.includes(item.value)

          return (
            <FilterGroup.Option
              key={item.value}
              label={item.label}
              value={item.value}
              resultCount={resultCount}
              checked={isActive}
              disabled={resultCount === 0 && !isActive}
              onChange={() => onToggle(section.key, item.value)}
            />
          )
        })}
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
