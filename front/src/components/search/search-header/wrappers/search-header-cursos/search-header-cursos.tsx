'use client'

import { searchAutocompleteCursosConfig } from '@/components/search/search-autocomplete/wrappers/search-autocomplete-cursos/search-autocomplete-cursos'
import { SearchHeader } from '@/components/search/search-header'
import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'

interface SearchHeaderCursosProps {
  module?: Module
}

export function SearchHeaderCursos({ module }: SearchHeaderCursosProps) {
  const { query, setQuery } = useSearchCursos()

  return (
    <SearchHeader module={module}>
      <SearchHeader.Autocomplete
        {...searchAutocompleteCursosConfig}
        defaultValue={query}
        onSearchSubmit={setQuery}
        placeholder="Ex.: Pedagogia, Enfermagem, Engenharia Civil…"
        submitLabel="Buscar"
      />
    </SearchHeader>
  )
}
