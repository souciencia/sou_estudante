'use client'

import {
  SortingOptions,
  type SortOption,
} from '@/components/search/sorting-options/sorting-options'
import type { Module } from '@/lib/module'
import { useSearchIes } from '@/services/api/use-search-ies'

const IES_SORT_OPTIONS: SortOption[] = [
  { label: 'A Z', value: 'az' },
  { label: 'Relevância', value: 'relevancia' },
]

interface SortingOptionsIesProps {
  module?: Module
}

export function SortingOptionsIes({ module }: SortingOptionsIesProps) {
  const { updateParams } = useSearchIes()

  return (
    <SortingOptions
      options={IES_SORT_OPTIONS}
      onSelect={(sort) => updateParams({ sort })}
      module={module}
    />
  )
}
