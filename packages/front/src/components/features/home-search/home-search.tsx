'use client'

import { useRouter } from 'next/navigation'
import { SearchAutocomplete } from '@/components/features/search-autocomplete/search-autocomplete'

export function buildCursosSearchHref(termo: string): string {
  const params = new URLSearchParams({ q: termo.trim() })
  return `/cursos?${params.toString()}`
}

export function HomeSearch() {
  const router = useRouter()

  const handleSearchSubmit = (termo: string) => {
    router.push(buildCursosSearchHref(termo))
  }

  return (
    <search>
      <SearchAutocomplete onSearchSubmit={handleSearchSubmit} />
    </search>
  )
}
