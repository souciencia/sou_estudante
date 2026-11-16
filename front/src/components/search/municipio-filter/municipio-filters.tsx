'use client'

import type { Module } from '@/lib/module'
import { ufLabel } from '@/lib/uf'
import type { MunicipiosMap } from '@/services/api/types'
import { MunicipioFilter } from './municipio-filter'

export interface MunicipioFiltersProps {
  /** Siglas das UFs selecionadas, uma por menu. */
  ufs: string[]
  municipios: MunicipiosMap
  /** Códigos IBGE selecionados. */
  selected: string[]
  onToggle: (codigo: string) => void
  /** Códigos com resultado na busca atual (desabilita os demais). */
  availableCodigos?: Set<string>
  module?: Module
  className?: string
}

/**
 * Coleção de menus de municípios: um `MunicipioFilter` por UF selecionada.
 * UFs sem municípios na base são ignoradas.
 */
export function MunicipioFilters({
  ufs,
  municipios,
  selected,
  onToggle,
  availableCodigos,
  module,
  className,
}: MunicipioFiltersProps) {
  const available = ufs.filter((uf) => (municipios[uf]?.length ?? 0) > 0)
  if (available.length === 0) return null

  return (
    <div className={className}>
      <div className="flex flex-col gap-3">
        {available.map((uf) => (
          <MunicipioFilter
            key={uf}
            label={`Municípios de ${ufLabel(uf)}`}
            options={municipios[uf]}
            selected={selected}
            onToggle={onToggle}
            availableCodigos={availableCodigos}
            module={module}
          />
        ))}
      </div>
    </div>
  )
}
