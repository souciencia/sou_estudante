'use client'

import { SearchInput } from '@/components/atoms/search-input'
import { SearchSortignOptions } from '@/components/features/search-sorting-options/search-sorting-options'
import { useSearchCursos } from '@/services/api/use-search-cursos'

export function SearchHeaderBlock() {
  const { query, setQuery } = useSearchCursos()

  return (
    <div className="p-2 border rounded-md">
      <SearchInput defaultValue={query} onSearchChange={setQuery} />

      <div className="my-4 pt-4 border-t border-gray-200">
        <SearchSortignOptions />
      </div>
    </div>
  )
}
