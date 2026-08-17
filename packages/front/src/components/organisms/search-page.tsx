'use client'

import { useState } from 'react'
import { SearchInput } from '@/components/atoms/search-input'
import { useSearchCursos } from '@/utils/use-search-cursos'
import { Button } from '../atoms/button'
import SearchResultList from './search/search-result-list'
import { cn } from '@/utils/cn'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const {
    results,
    isLoading,
    error,
    total,
    currentPage,
    links,
    navigateToPage,
  } = useSearchCursos(query)

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

      <main className={cn(`m-2 p-8 max-w-[1000]`)}>
        <SearchResultList
          cursos={results}
          isLoading={isLoading}
          error={error}
          total={total}
          currentPage={currentPage}
          links={links}
          onNavigate={navigateToPage}
        />
      </main>
    </div>
  )
}
