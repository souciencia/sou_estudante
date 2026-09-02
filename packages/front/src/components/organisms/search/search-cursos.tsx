// components/organisms/search/search-cursos.tsx
'use client'

import { SearchInput } from '@/components/atoms/search-input'
import { Typo } from '@/components/atoms/typo'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import SearchResultList from './search-result-list'

export function SearchCursos() {
  const {
    query,
    results,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    links,
    setQuery,
    navigateToPage,
  } = useSearchCursos()

  return (
    <div className="space-y-6">
      <Typo v="title" s="2xl" t="h1">
        Buscar Cursos
      </Typo>
      <SearchInput defaultValue={query} onSearchChange={setQuery} />
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
    </div>
  )
}
