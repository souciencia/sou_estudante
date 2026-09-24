'use client'

import {
  SortingOptions,
  type SortOption,
} from '@/components/search/sorting-options/sorting-options'
import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'

const CURSOS_SORT_OPTIONS: SortOption[] = [
  { label: 'Maior Enade', value: 'enade' },
  { label: 'Menor desistência', value: 'desistencia' },
  { label: 'A Z', value: 'az' },
]

interface SortingOptionsCursosProps {
  module?: Module
}

export function SortingOptionsCursos({ module }: SortingOptionsCursosProps) {
  const { updateParams } = useSearchCursos()

  return (
    <SortingOptions
      options={CURSOS_SORT_OPTIONS}
      onSelect={(sort) => updateParams({ sort })}
      module={module}
    />
  )
}
