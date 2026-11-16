import { Fragment, type ReactNode } from 'react'
import { Pagination } from '@/components/search/search-pagination/search-pagination'
import { SkeletonCard } from '@/components/ui/card/skeleton-card'
import { ErrorMessage } from '@/components/ui/error-message'
import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'
import type { PaginationLinks } from '@/services/api/types'

export interface SearchResultsLabels {
  singular: string
  plural: string
  /** Texto completo no singular (ex.: "curso encontrado"). */
  foundSingular?: string
  /** Texto completo no plural (ex.: "cursos encontrados"). */
  foundPlural?: string
}

export interface SearchResultsProps<TItem> {
  items: TItem[]
  renderItem: (item: TItem, index: number) => ReactNode
  getItemKey: (item: TItem, index: number) => string
  labels: SearchResultsLabels
  isLoading?: boolean
  error?: string | null
  total?: number
  currentPage?: number
  limit?: number
  links?: PaginationLinks | null
  onNavigate?: (url: string) => void
  module?: Module
  emptyMessage?: string
  skeletonCount?: number
  /** Exibe a linha de contagem de resultados. Desative quando a contagem for
   *  renderizada fora da lista (ex.: no layout, ao lado da ordenação). */
  showCount?: boolean
  /** Conteúdo extra exibido após a lista, logo antes da paginação. */
  footer?: ReactNode
}

/**
 * Lista de resultados de busca agnóstica: cuida de loading, erro, vazio,
 * contagem e paginação, e delega a renderização de cada item ao consumidor.
 */
export function SearchResults<TItem>({
  items,
  renderItem,
  getItemKey,
  labels,
  isLoading,
  error,
  total = 0,
  currentPage = 1,
  limit = 20,
  links,
  onNavigate,
  module,
  emptyMessage,
  skeletonCount = 3,
  showCount = true,
  footer,
}: SearchResultsProps<TItem>) {
  if (isLoading) {
    return (
      <div
        className="grid gap-4"
        role="status"
        aria-label="Carregando resultados"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeletons estáticos
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <Typo v="mute" s="sm" t="p">
          {emptyMessage ?? `Nenhum ${labels.singular} encontrado`}
        </Typo>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showCount && (
        <div className="flex items-center gap-2">
          <Typo v="mute" s="sm" t="p">
            {total > 0
              ? `${total} ${
                  total === 1
                    ? (labels.foundSingular ?? `${labels.singular} encontrado`)
                    : (labels.foundPlural ?? `${labels.plural} encontrados`)
                }`
              : `${items.length} ${items.length === 1 ? labels.singular : labels.plural}`}
          </Typo>
        </div>
      )}
      <div className="grid gap-4">
        {items.map((item, index) => (
          <Fragment key={getItemKey(item, index)}>
            {renderItem(item, index)}
          </Fragment>
        ))}
      </div>

      {footer}

      {links && onNavigate && (
        <Pagination
          links={links}
          currentPage={currentPage}
          total={total}
          limit={limit}
          onNavigate={onNavigate}
          module={module}
        />
      )}
    </div>
  )
}
