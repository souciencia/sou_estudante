'use client'

import { useRouter } from 'next/navigation'
import { SearchAutocompleteCursos } from '@/components/search/search-autocomplete/wrappers/search-autocomplete-cursos/search-autocomplete-cursos'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

export interface CourseSearchEntryProps {
  module?: Module
  className?: string
}

/**
 * Barra de busca geral de cursos: redireciona para a busca de cursos
 * (`/cursos?q=...`) sem origem (sem `to`), usada na home.
 */
export function CourseSearchEntry({
  module,
  className,
}: CourseSearchEntryProps) {
  const router = useRouter()

  const handleSubmit = (value: string) => {
    const params = new URLSearchParams({ q: value })
    router.push(`/cursos?${params.toString()}`)
  }

  return (
    <SearchAutocompleteCursos
      module={module}
      onSearchSubmit={handleSubmit}
      submitLabel="Buscar"
      className={cn(className)}
    />
  )
}
