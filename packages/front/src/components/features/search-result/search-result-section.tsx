'use client'

import SearchResultList from '@/components/features/search-result/search-result-list'
<<<<<<< HEAD
import type { Module } from '@/lib/module'
=======
>>>>>>> b14e213 (Dropa a organização em design atômico para os componentes)
import { useSearchCursos } from '@/services/api/use-search-cursos'

interface SearchResultSectionProps {
  module?: Module
}

export default function SearchResultSection({
  module,
}: SearchResultSectionProps) {
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
      module={module}
    />
  )
}
