'use client'

import { Button } from '@/components/atoms/button'
import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'

interface SearchSortingOptionsProps {
  module?: Module
}

export function SearchSortignOptions({ module }: SearchSortingOptionsProps) {
  const { updateParams } = useSearchCursos()

  const handleSort = (sortOption: string) => {
    updateParams({ sort: sortOption })
  }

  return (
    <div className="flex gap-2">
      <Button module={module} onClick={() => handleSort('enade')}>
        Maior Enade
      </Button>
      <Button module={module} onClick={() => handleSort('desistencia')}>
        Menor desistência
      </Button>
      <Button module={module} onClick={() => handleSort('az')}>
        A Z
      </Button>
    </div>
  )
}
