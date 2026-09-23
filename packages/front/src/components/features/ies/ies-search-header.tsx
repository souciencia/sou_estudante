'use client'

import { SearchAutocomplete } from '@/components/features/search-autocomplete/search-autocomplete'
import {
  SortingOptions,
  type SortOption,
} from '@/components/features/search-sorting-options/sorting-options'
import type { Module } from '@/lib/module'
import { useSearchIes } from '@/services/api/use-search-ies'
import { useSugestoesIes } from '@/services/api/use-sugestoes-ies'

const IES_SORT_OPTIONS: SortOption[] = [
  { label: 'A Z', value: 'az' },
  { label: 'Relevância', value: 'relevancia' },
]

interface IesSearchHeaderProps {
  module?: Module
}

export function IesSearchHeader({ module }: IesSearchHeaderProps) {
  const { query, setQuery, updateParams } = useSearchIes()

  return (
    <div
      data-module={module}
      className="rounded-md border p-2 font-coadjuvant text-fg-coadjuvant"
    >
      <SearchAutocomplete
        defaultValue={query}
        onSearchSubmit={setQuery}
        module={module}
        useSuggestions={useSugestoesIes}
        placeholder="Busque pelo nome da instituição"
        searchLabel="Buscar instituição pelo nome"
        listLabel="Sugestões de instituições"
      />

      <div className="my-4 border-t border-gray-200 pt-4">
        <SortingOptions
          options={IES_SORT_OPTIONS}
          onSelect={(sort) => updateParams({ sort })}
          module={module}
        />
      </div>
    </div>
  )
}
