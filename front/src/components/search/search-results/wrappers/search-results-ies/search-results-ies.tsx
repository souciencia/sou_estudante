'use client'

import { SearchResults } from '@/components/search/search-results/search-results'
import type { Module } from '@/lib/module'
import type { IES } from '@/services/api/types'
import { useSearchIes } from '@/services/api/use-search-ies'
import { IesResultItem } from './ies-result-item'
import { SearchResultsIesSummary } from './search-results-ies-summary'

interface SearchResultsIesProps {
  module?: Module
}

export function SearchResultsIes({ module }: SearchResultsIesProps) {
  const {
    results,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    links,
    navigateToPage,
  } = useSearchIes()

  return (
    <SearchResults<IES>
      items={results}
      isLoading={isLoading}
      error={error}
      total={total}
      currentPage={currentPage}
      limit={limit}
      links={links}
      onNavigate={navigateToPage}
      labels={{
        singular: 'instituição',
        plural: 'instituições',
        foundSingular: 'instituição encontrada',
        foundPlural: 'instituições encontradas',
      }}
      emptyMessage="Nenhuma instituição encontrada"
      showCount={false}
      footer={<SearchResultsIesSummary />}
      getItemKey={(ies, index) => ies.co_ies ?? `ies-${index}`}
      renderItem={(ies) => <IesResultItem ies={ies} module={module} />}
      module={module}
    />
  )
}
