'use client'

import { SearchHeader } from '@/components/search/search-header'
import {
  SortingOptions,
  type SortOption,
} from '@/components/search/sorting-options/sorting-options'
import type { Module } from '@/lib/module'
import { useSearchIes } from '@/services/api/use-search-ies'
import { useSugestoesIes } from '@/services/api/use-sugestoes-ies'

const IES_SORT_OPTIONS: SortOption[] = [
  { label: 'A Z', value: 'az' },
  { label: 'Relevância', value: 'relevancia' },
]

interface SearchHeaderIesProps {
  module?: Module
}

export function SearchHeaderIes({ module }: SearchHeaderIesProps) {
  const { query, setQuery, updateParams } = useSearchIes()

  return (
    <SearchHeader module={module}>
      <SearchHeader.Autocomplete
        defaultValue={query}
        onSearchSubmit={setQuery}
        useSuggestions={useSugestoesIes}
        placeholder="Busque pelo nome da instituição"
        searchLabel="Buscar instituição pelo nome"
        listLabel="Sugestões de instituições"
      />

      <SearchHeader.Sorting>
        <SortingOptions
          options={IES_SORT_OPTIONS}
          onSelect={(sort) => updateParams({ sort })}
          module={module}
        />
      </SearchHeader.Sorting>
    </SearchHeader>
  )
}
