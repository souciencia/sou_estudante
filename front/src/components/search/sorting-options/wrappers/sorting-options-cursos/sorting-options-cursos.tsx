'use client'

import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const sort = searchParams?.get('sort') ?? undefined

  return (
    <SortingOptions
      options={CURSOS_SORT_OPTIONS}
      value={sort}
      onSelect={(nextSort) => updateParams({ sort: nextSort })}
      module={module}
    />
  )
}
