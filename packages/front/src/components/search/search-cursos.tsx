'use client'

import { useState } from 'react'
import { SearchInput } from '@/components/form-elements/search-input'
import { Typo } from '@/components/text/typo'
import { useSearchCursos } from '@/utils/use-search-cursos'
import SearchResultList from './search-result-list'

export function SearchCursos() {
  const [query, setQuery] = useState('')
  const {
    results,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    links,
    navigateToPage,
  } = useSearchCursos(query)

  return (
    <div className="space-y-6">
      <Typo v="title" s="2xl" t="h1">
        Buscar Cursos
      </Typo>
      <SearchInput onSearchChange={setQuery} />
      <SearchResultList
        cursos={results}
        isLoading={isLoading}
        error={error}
        total={total}
        currentPage={currentPage}
        links={links}
        onNavigate={navigateToPage}
      />
    </div>
  )
}
