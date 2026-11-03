'use client'

import { CATEGORIAS_ADMINISTRATIVAS } from '@/components/search/filters-panel/filters-helpers'
import {
  type FilterSectionDefinition,
  FiltersPanel,
} from '@/components/search/filters-panel/filters-panel'
import { useFilterPanel } from '@/components/search/filters-panel/use-filter-panel'
import { SortingOptionsCursos } from '@/components/search/sorting-options/wrappers/sorting-options-cursos/sorting-options-cursos'
import type { Module } from '@/lib/module'
import { ufOptions } from '@/lib/uf'
import { useSearchCursos } from '@/services/api/use-search-cursos'

/** Quantidade de UFs visíveis antes de expandir (as prioritárias de `ufOptions`). */
const UFS_VISIVEIS = 3

const TURNOS = [
  { label: 'Diurno', value: 'Diurno' },
  { label: 'Noturno', value: 'Noturno' },
  { label: 'Integral', value: 'Integral' },
  { label: 'EaD', value: 'EaD' },
]

const GRAUS_ACADEMICOS = [
  { label: 'Bacharelado', value: 'Bacharelado' },
  { label: 'Licenciatura', value: 'Licenciatura' },
  { label: 'Tecnológico', value: 'Tecnológico' },
]

const MODALIDADES = [
  { label: 'Presencial', value: 'Presencial' },
  { label: 'EaD / Semipresencial', value: 'EaD' },
]

const CONCEITOS_ENADE = [
  { label: 'Conceito 5', value: '5' },
  { label: 'Conceito 4', value: '4' },
  { label: 'Conceito 3', value: '3' },
  { label: 'Conceito 2', value: '2' },
  { label: 'Conceito 1', value: '1' },
  { label: 'Sem avaliação no Ciclo', value: 'Sem avaliação no Ciclo' },
  { label: 'Sem conceito', value: 'SC' },
]

const INGRESSOS = [
  { label: 'Gratuito', value: 'gratuito' },
  { label: 'Com vagas Sisu', value: 'sisu' },
]

const SECTIONS: FilterSectionDefinition[] = [
  {
    key: 'uf',
    title: 'Estado',
    aggregationKey: 'ufs',
    options: ufOptions(),
    visibleCount: UFS_VISIVEIS,
    moreLabel: (hidden) => `+ ${hidden} estados`,
    lessLabel: 'Ver menos estados',
  },
  {
    key: 'turno',
    title: 'Turno · Censo',
    aggregationKey: 'turnos',
    options: TURNOS,
  },
  {
    key: 'grau',
    title: 'Grau acadêmico',
    aggregationKey: 'graus',
    options: GRAUS_ACADEMICOS,
  },
  {
    key: 'categoria',
    title: 'Categoria',
    aggregationKey: 'categorias',
    options: CATEGORIAS_ADMINISTRATIVAS,
  },
  {
    key: 'modalidade',
    title: 'Modalidade',
    aggregationKey: 'modalidades',
    options: MODALIDADES,
  },
  {
    key: 'enade',
    title: 'Conceito Enade',
    aggregationKey: 'enades',
    options: CONCEITOS_ENADE,
  },
  {
    key: 'ingresso',
    title: 'Ingresso',
    aggregationKey: 'ingresso',
    options: INGRESSOS,
  },
]

interface FiltersPanelCursosProps {
  module?: Module
  className?: string
}

export function FiltersPanelCursos({
  module,
  className,
}: FiltersPanelCursosProps) {
  const { updateParams, aggregations, resetFilters } = useSearchCursos()
  const { getActiveValues, toggle, apply } = useFilterPanel(updateParams)

  return (
    <FiltersPanel
      sections={SECTIONS}
      aggregations={aggregations}
      activeValues={getActiveValues}
      onToggle={toggle}
      onApply={apply}
      onClear={resetFilters}
      leading={<SortingOptionsCursos module={module} />}
      module={module}
      className={className}
    />
  )
}
