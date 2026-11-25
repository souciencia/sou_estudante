'use client'

import { useSearchParams } from 'next/navigation'
import { ActiveFiltersCursos } from '@/components/search/active-filters/wrappers/active-filters-cursos/active-filters-cursos'
import { FilterGroup } from '@/components/search/filter-group'
import { CATEGORIAS_ADMINISTRATIVAS } from '@/components/search/filters-panel/filters-helpers'
import {
  type FilterSectionDefinition,
  FiltersPanel,
} from '@/components/search/filters-panel/filters-panel'
import { useMunicipioFilterPanel } from '@/components/search/filters-panel/use-municipio-filter-panel'
import { MunicipioFilters } from '@/components/search/municipio-filter/municipio-filters'
import { SearchHelp } from '@/components/search/search-help/search-help'
import { SortingOptionsCursos } from '@/components/search/sorting-options/wrappers/sorting-options-cursos/sorting-options-cursos'
import type { Module } from '@/lib/module'
import { ufOptions } from '@/lib/uf'
import { useMunicipios } from '@/services/api/use-municipios'
import { useSearchCursos } from '@/services/api/use-search-cursos'

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
  { label: 'Sem avaliação', value: 'Sem avaliação' },
  { label: 'Sem conceito', value: 'Sem conceito' },
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
  },
  {
    key: 'turno',
    title: 'Turno',
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

/**
 * Alternador "Mostrar resultados parecidos": desligado por padrão, mantém a
 * busca por nome exato (`exact=true`). Ligado, inclui cursos com nome parecido.
 */
function SimilarResultsToggle() {
  const { updateParams } = useSearchCursos()
  const searchParams = useSearchParams()

  const showSimilar = searchParams?.get('exact') === 'false'

  const handleChange = () => {
    updateParams({ exact: showSimilar ? null : 'false', page: '1' })
  }

  return (
    <FilterGroup.Option
      type="checkbox"
      label="Mostrar resultados parecidos"
      checked={showSimilar}
      onChange={handleChange}
    />
  )
}

interface FiltersPanelCursosProps {
  module?: Module
  className?: string
}

export function FiltersPanelCursos({
  module,
  className,
}: FiltersPanelCursosProps) {
  const { updateParams, aggregations, resetFilters } = useSearchCursos()
  const { municipios } = useMunicipios()
  const { getActiveValues, onToggle, onApply } = useMunicipioFilterPanel(
    updateParams,
    municipios,
  )
  const availableCodigos = aggregations?.municipios
    ? new Set(aggregations.municipios.map((bucket) => bucket.key))
    : undefined

  return (
    <>
      <FiltersPanel
        sections={SECTIONS}
        aggregations={aggregations}
        activeValues={getActiveValues}
        onToggle={onToggle}
        onApply={onApply}
        onClear={resetFilters}
        activeFilters={<ActiveFiltersCursos module={module} />}
        leading={
          <SortingOptionsCursos
            module={module}
            trailing={<SimilarResultsToggle />}
          />
        }
        afterSection={(section, ctx) =>
          section.key === 'uf' ? (
            <MunicipioFilters
              ufs={ctx.activeValues('uf')}
              municipios={municipios}
              selected={ctx.activeValues('municipio')}
              onToggle={(codigo) => ctx.onToggle('municipio', codigo)}
              availableCodigos={availableCodigos}
              module={module}
            />
          ) : null
        }
        module={module}
        className={className}
      />

      <SearchHelp module={module} />
    </>
  )
}
