import { SearchHeaderActions } from './search-header-actions'
import { SearchHeaderAutocomplete } from './search-header-autocomplete'
import { SearchHeaderRoot } from './search-header-root'
import { SearchHeaderSorting } from './search-header-sorting'

export const SearchHeader = Object.assign(SearchHeaderRoot, {
  Autocomplete: SearchHeaderAutocomplete,
  Actions: SearchHeaderActions,
  Sorting: SearchHeaderSorting,
})

export type { SearchHeaderActionsProps } from './search-header-actions'
export type { SearchHeaderAutocompleteProps } from './search-header-autocomplete'
export type { SearchHeaderRootProps } from './search-header-root'
export type { SearchHeaderSortingProps } from './search-header-sorting'
