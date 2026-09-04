'use client'

import { Button } from '@/components/atoms/button'
import { useSearchCursos } from '@/services/api/use-search-cursos'

export function SearchSortignOptions() {
  const { updateParams } = useSearchCursos()

  const handleSort = (sortOption: string) => {
    updateParams({ sort: sortOption })
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => handleSort('enade')}>Maior Enade</Button>
      <Button onClick={() => handleSort('desistencia')}>
        Menor desistência
      </Button>
      <Button onClick={() => handleSort('az')}>A Z</Button>
    </div>
  )
}
