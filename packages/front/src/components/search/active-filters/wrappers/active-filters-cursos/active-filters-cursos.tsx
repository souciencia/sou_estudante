'use client'

import { ActiveFilters as ActiveFiltersBase } from '@/components/search/active-filters/active-filters'
import type { Module } from '@/lib/module'
import { municipioNome } from '@/lib/municipio'
import { useMunicipios } from '@/services/api/use-municipios'
import { useSearchCursos } from '@/services/api/use-search-cursos'

const FILTER_KEYS = [
  'uf',
  'municipio',
  'turno',
  'grau',
  'categoria',
  'modalidade',
  'enade',
  'sort',
]

interface ActiveFiltersCursosProps {
  module?: Module
  className?: string
}

export function ActiveFiltersCursos({
  module,
  className,
}: ActiveFiltersCursosProps) {
  const { updateParams, resetFilters } = useSearchCursos()
  const { municipios } = useMunicipios()

  return (
    <ActiveFiltersBase
      filterKeys={FILTER_KEYS}
      labelFor={(key, value) =>
        key === 'municipio'
          ? (municipioNome(municipios, value) ?? value)
          : value
      }
      updateParams={updateParams}
      resetFilters={resetFilters}
      module={module}
      className={className}
    />
  )
}
