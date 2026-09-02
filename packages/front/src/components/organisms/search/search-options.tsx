// components/organisms/search/search-options.tsx
'use client'

import { Button } from '@/components/atoms/button'
import { SearchInput } from '@/components/atoms/search-input'
import { useSearchCursos } from '@/services/api/use-search-cursos'

export function SearchOptions() {
  const { query, setQuery, updateParams } = useSearchCursos()

  const handleSort = (sortOption: string) => {
    updateParams({ sort: sortOption })
  }

  return (
    <div className="p-2 border rounded-md">
      <SearchInput defaultValue={query} onSearchChange={setQuery} />

      <div className="my-4 pt-4 border-t border-gray-200 flex gap-2">
        <Button onClick={() => handleSort('enade')}>Maior Enade</Button>
        <Button onClick={() => handleSort('desistencia')}>
          Menor desistência
        </Button>
        <Button onClick={() => handleSort('az')}>A Z</Button>
      </div>
    </div>
  )
}
