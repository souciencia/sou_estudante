'use client'

import { SearchHeader } from '@/components/search/search-header'
import type { Module } from '@/lib/module'
import { useSearchIes } from '@/services/api/use-search-ies'
import { useSugestoesIes } from '@/services/api/use-sugestoes-ies'

interface SearchHeaderIesProps {
  module?: Module
}

export function SearchHeaderIes({ module }: SearchHeaderIesProps) {
  const { query, setQuery } = useSearchIes()

  return (
    <SearchHeader module={module}>
      <SearchHeader.Autocomplete
        defaultValue={query}
        onSearchSubmit={setQuery}
        useSuggestions={useSugestoesIes}
        placeholder="Ex.: USP, Unifesp, UNICAMP…"
        searchLabel="Buscar instituição pelo nome"
        listLabel="Sugestões de instituições"
        submitLabel="Buscar"
      />
    </SearchHeader>
  )
}
