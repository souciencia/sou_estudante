'use client'

import { useState } from 'react'
import { Typo } from '@/components/text/typo'
import { SearchInput } from '@/components/form-elements/search-input'
import SearchResultList from './search-result-list'
import { useSearchCursos } from '@/utils/use-search-cursos'

export function SearchCursos() {
  const [query, setQuery] = useState('')
  const { results, isLoading, error } = useSearchCursos(query)

  return (
    <div className="space-y-6">
      <Typo v="title" s="2xl" t="h1">
        Buscar Cursos
      </Typo>
      <SearchInput onSearchChange={setQuery} />
      <SearchResultList cursos={results} isLoading={isLoading} error={error} />
    </div>
  )
}
