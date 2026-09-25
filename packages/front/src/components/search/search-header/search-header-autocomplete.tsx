'use client'

import {
  SearchAutocomplete,
  type SearchAutocompleteProps,
} from '@/components/search/search-autocomplete/search-autocomplete'
import { useSearchHeaderContext } from './search-header-context'

export type SearchHeaderAutocompleteProps = Omit<
  SearchAutocompleteProps,
  'module'
>

export function SearchHeaderAutocomplete(props: SearchHeaderAutocompleteProps) {
  const { module } = useSearchHeaderContext('SearchHeader.Autocomplete')
  return <SearchAutocomplete module={module} {...props} />
}
