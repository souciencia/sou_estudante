'use client'

import { SlidersHorizontal } from 'lucide-react'
import { Fragment, type ReactNode, useId, useState } from 'react'
import { FilterGroup } from '@/components/search/filter-group'
import { BottomSheet } from '@/components/ui/bottom-sheet/bottom-sheet'
import { Button } from '@/components/ui/button/button'
import { Typo } from '@/components/ui/typo'
import {
  MOBILE_MEDIA_QUERY,
  useMediaQuery,
} from '@/components/ui/use-media-query'
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
  /** Grava de uma vez o estado completo dos filtros (usado no mobile ao aplicar). */
  onApply?: (values: Record<string, string[]>) => void
  /** Limpa todos os filtros ativos. Sem ele, desmarca cada valor ativo. */
  onClear?: () => void
  /** Conteúdo exibido como primeiro item, antes das seções de filtro. */
  leading?: ReactNode
  /** Conteúdo extra renderizado logo após uma seção (ex.: menus de municípios após "uf"). */
  afterSection?: (
    section: FilterSectionDefinition,
    context: {
      activeValues: (key: string) => string[]
      onToggle: (key: string, value: string) => void
    },
  ) => ReactNode | null
  module?: Module
  className?: string
}

/**
 * Painel de filtros agnóstico: recebe a definição das seções, as agregações da
 * API e os callbacks de estado, sem conhecer o domínio (cursos, IES, ...).
 *
 * Em telas abaixo de `md` vira um bottom sheet aberto por um botão-gatilho; em
 * telas maiores mantém o card inline.
 */
export function FiltersPanel({
  sections,
  aggregations,
  activeValues,
  onToggle,
  onApply,
  onClear,
  leading,
  afterSection,
  module,
  className,
}: FiltersPanelProps) {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Record<string, string[]> | null>(null)
  const titleId = useId()
  const sheetId = useId()

  const drafting = isMobile && draft !== null
  const resolvedActiveValues = drafting
    ? (key: string) => draft?.[key] ?? []
    : activeValues
  const toggleDraft = (key: string, value: string) => {
    setDraft((current) =>
      current ? toggleDraftValues(current, key, value) : current,
    )
  }
  const resolvedOnToggle = drafting ? toggleDraft : onToggle

  const hasActiveFilters = sections.some(
    (section) => resolvedActiveValues(section.key).length > 0,
  )
  const activeCount = sections.reduce(
    (sum, section) => sum + activeValues(section.key).length,
    0,
  )

  const openSheet = () => {
    setDraft(
      Object.fromEntries(
        sections.map((section) => [section.key, activeValues(section.key)]),
      ),
    )
    setOpen(true)
  }

  const closeSheet = () => {
    setOpen(false)
    setDraft(null)
  }

  const applyDraft = () => {
    if (draft) onApply?.(draft)
    closeSheet()
  }

  const handleClear = () => {
    if (drafting) {
      setDraft(Object.fromEntries(sections.map((section) => [section.key, []])))
      return
    }

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

  const content = (
    <>
      <header className="flex items-center justify-between">
        <Typo
          t="h2"
          s="sm"
          id={titleId}
          className={cn(
            'font-display font-bold uppercase tracking-[0.14em] text-fg',
          )}
        >
          Filtros
        </Typo>

        <button
          type="button"
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className={cn(
            'rounded-sm tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
            hasActiveFilters
              ? 'cursor-pointer text-accent-deep hover:underline'
              : 'cursor-not-allowed text-fg-muted',
          )}
        >
          <span className="text-xs">Limpar</span>
        </button>
      </header>

      {leading && (
        <>
          {leading}
          <hr
            className={cn('m-0 h-px w-full border-0 bg-border-border-primary')}
          />
        </>
      )}

      {sections.map((section, index) => (
        <Fragment key={section.key}>
          {index > 0 && (
            <hr
              className={cn(
                'm-0 h-px w-full border-0 bg-border-border-primary',
              )}
            />
          )}
          <FilterSection
            section={section}
            aggregations={aggregations}
            activeValues={resolvedActiveValues}
            onToggle={resolvedOnToggle}
          />
          {afterSection?.(section, {
            activeValues: resolvedActiveValues,
            onToggle: resolvedOnToggle,
          })}
        </Fragment>
      ))}
    </>
  )

  if (isMobile) {
    return (
      <>
        <Button
          module={module}
          v="outline"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={sheetId}
          onClick={openSheet}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros
          {activeCount > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                'rounded-full bg-accent/10 px-1.5 text-xs font-semibold tabular-nums text-accent-fg',
              )}
            >
              {activeCount}
            </span>
          )}
        </Button>

        <BottomSheet
          id={sheetId}
          open={open}
          onClose={closeSheet}
          labelledBy={titleId}
        >
          <div
            data-module={module}
            className={cn('flex flex-col font-sans text-fg', className)}
          >
            <div className="flex flex-col gap-6 p-6">{content}</div>
            <div className="sticky bottom-0 border-t border-border-primary bg-surface-lv1 px-6 py-4">
              <Button
                module={module}
                v="solid"
                onClick={applyDraft}
                className="w-full justify-center"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </BottomSheet>
      </>
    )
  }

  return (
    <div
      data-module={module}
      className={cn(
        'flex flex-col gap-6 rounded-card border border-border-primary bg-filters-bg p-6 font-sans text-fg shadow-sm',
        className,
      )}
    >
      {content}
    </div>
  )
}

function toggleDraftValues(
  draft: Record<string, string[]>,
  key: string,
  value: string,
): Record<string, string[]> {
  const values = draft[key] ?? []
  const next = values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
  return { ...draft, [key]: next }
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
            'mt-2 text-left text-sm text-accent-deep hover:underline cursor-pointer',
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
