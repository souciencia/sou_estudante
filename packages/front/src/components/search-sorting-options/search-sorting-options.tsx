'use client'

import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { SortingOptions, type SortOption } from './sorting-options'

const CURSOS_SORT_OPTIONS: SortOption[] = [
  { label: 'Maior Enade', value: 'enade' },
  { label: 'Menor desistência', value: 'desistencia' },
  { label: 'A Z', value: 'az' },
]

interface SearchSortingOptionsProps {
  module?: Module
}

export function SearchSortignOptions({ module }: SearchSortingOptionsProps) {
  const { updateParams } = useSearchCursos()

  return (
    <SortingOptions
      options={CURSOS_SORT_OPTIONS}
      onSelect={(sort) => updateParams({ sort })}
      module={module}
    />
  )
}
