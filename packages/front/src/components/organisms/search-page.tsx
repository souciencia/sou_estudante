// components/organisms/search-page.tsx
'use client'

import { Button } from '@/components/atoms/button'
import { SearchInput } from '@/components/atoms/search-input'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { cn } from '@/utils/cn'
import SearchResultList from './search/search-result-list'

export function SearchPage() {
  const {
    query,
    results,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    links,
    setQuery,
    navigateToPage,
    updateParams,
  } = useSearchCursos()

  const handleSort = (sortOption: string) => {
    updateParams({ sort: sortOption })
  }

  return (
    <div className="flex flex-col space-y-6 border">
      <div className="p-2">
        <SearchInput defaultValue={query} onSearchChange={setQuery} />
        <div className="my-4 pt-4 border-t-2 border-gray-300 flex gap-2">
          <Button onClick={() => handleSort('enade')}>Maior Enade</Button>
          <Button onClick={() => handleSort('desistencia')}>
            Menor desistência
          </Button>
          <Button onClick={() => handleSort('az')}>A Z</Button>
        </div>
      </div>

      <aside />

      <main className={cn('m-2 p-8 max-w-[1000]')}>
        <SearchResultList
          cursos={results}
          isLoading={isLoading}
          error={error}
          total={total}
          currentPage={currentPage}
          limit={limit}
          links={links}
          onNavigate={navigateToPage}
        />
      </main>
    </div>
  )
}
