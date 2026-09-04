'use client'

import SearchResultList from '@/components/features/search-result/search-result-list'
import { useSearchCursos } from '@/services/api/use-search-cursos'

export default function SearchResultSection() {
  const {
    results,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    links,
    navigateToPage,
  } = useSearchCursos()

  return (
    <SearchResultList
      cursos={results}
      isLoading={isLoading}
      error={error}
      total={total}
      currentPage={currentPage}
      limit={limit}
      links={links}
      onNavigate={navigateToPage}
    />
  )
}
