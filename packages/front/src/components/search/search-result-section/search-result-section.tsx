import type { ReactNode } from 'react'
import {
  SearchResults,
  type SearchResultsLabels,
} from '@/components/search/search-results/search-results'
import type { Module } from '@/lib/module'
import type { PaginationLinks } from '@/services/api/types'

export interface SearchResultSectionProps<TItem> {
  items: TItem[]
  isLoading: boolean
  error: string | null
  total: number
  currentPage: number
  limit: number
  links: PaginationLinks | null
  onNavigate: (url: string) => void
  labels: SearchResultsLabels
  emptyMessage?: string
  getItemKey: (item: TItem, index: number) => string
  renderItem: (item: TItem) => ReactNode
  module?: Module
}

/**
 * Seção de resultados agnóstica: conecta o estado de uma busca ao
 * `SearchResults`. O domínio entra via `labels`, `getItemKey` e `renderItem`.
 */
export function SearchResultSection<TItem>({
  items,
  isLoading,
  error,
  total,
  currentPage,
  limit,
  links,
  onNavigate,
  labels,
  emptyMessage,
  getItemKey,
  renderItem,
  module,
}: SearchResultSectionProps<TItem>) {
  return (
    <SearchResults<TItem>
      items={items}
      isLoading={isLoading}
      error={error}
      total={total}
      currentPage={currentPage}
      limit={limit}
      links={links}
      onNavigate={onNavigate}
      labels={labels}
      emptyMessage={emptyMessage}
      getItemKey={getItemKey}
      renderItem={renderItem}
      module={module}
    />
  )
}
