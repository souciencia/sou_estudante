'use client'

import {
  SearchAutocomplete,
  type SearchAutocompleteProps,
} from '@/components/search/search-autocomplete/search-autocomplete'

export type SearchHeaderAutocompleteProps = Omit<
  SearchAutocompleteProps,
  'module'
>

/** O tema do módulo vem do `data-module` do `SearchHeader` (herdado por CSS). */
export function SearchHeaderAutocomplete(props: SearchHeaderAutocompleteProps) {
  return <SearchAutocomplete {...props} />
}
