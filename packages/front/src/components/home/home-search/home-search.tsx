'use client'

import { useRouter } from 'next/navigation'
import { SearchAutocomplete } from '@/components/search/search-autocomplete/search-autocomplete'
import type { Module } from '@/lib/module'

export function buildCursosSearchHref(termo: string): string {
  const params = new URLSearchParams({ q: termo.trim() })
  return `/cursos?${params.toString()}`
}

interface HomeSearchProps {
  module?: Module
}

export function HomeSearch({ module }: HomeSearchProps) {
  const router = useRouter()

  const handleSearchSubmit = (termo: string) => {
    router.push(buildCursosSearchHref(termo))
  }

  return (
    <search>
      <SearchAutocomplete module={module} onSearchSubmit={handleSearchSubmit} />
    </search>
  )
}
