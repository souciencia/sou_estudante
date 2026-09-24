'use client'

import { SearchResultSection as SearchResultSectionBase } from '@/components/search/search-result-section/search-result-section'
import type { Module } from '@/lib/module'
import type { IES } from '@/services/api/types'
import { useSearchIes } from '@/services/api/use-search-ies'
import IesResultItem from './ies-result-item'

interface SearchResultSectionIesProps {
  module?: Module
}

export default function SearchResultSectionIes({
  module,
}: SearchResultSectionIesProps) {
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
    <SearchResultSectionBase<IES>
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
      getItemKey={(ies, index) => ies.co_ies ?? `ies-${index}`}
      renderItem={(ies) => <IesResultItem ies={ies} module={module} />}
      module={module}
    />
  )
}
