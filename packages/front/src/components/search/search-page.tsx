'use client'

import { useState } from 'react'
import { SearchInput } from '@/components/form-elements/search-input'
import SearchResultList from './search-result-list'
import { useSearchCursos } from '@/utils/use-search-cursos'
import { Button } from '../button/button'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const { results, isLoading, error } = useSearchCursos(query)

  return (
    <div className="flex flex-col space-y-6 border">
      <div className="p-2">
        <SearchInput onSearchChange={setQuery} />
        <div className="my-4 pt-4 border-t-2 border-gray-300">
          <Button>Maior Enade</Button>
          <Button>Menor desistência</Button>
          <Button>A Z</Button>
        </div>
      </div>

      <aside></aside>

      <main>
        <SearchResultList
          cursos={results}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </div>
  )
}
