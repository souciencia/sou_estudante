'use client'

import { useSearchParams } from 'next/navigation'
import { useId } from 'react'
import { CATEGORIAS_ADMINISTRATIVAS } from '@/components/search/filters-panel/filters-helpers'
import {
  type FilterSectionDefinition,
  FiltersPanel,
} from '@/components/search/filters-panel/filters-panel'
import { useMunicipioFilterPanel } from '@/components/search/filters-panel/use-municipio-filter-panel'
import { MunicipioFilters } from '@/components/search/municipio-filter/municipio-filters'
import { SortingOptionsCursos } from '@/components/search/sorting-options/wrappers/sorting-options-cursos/sorting-options-cursos'
import { Switch } from '@/components/ui/switch/switch'
import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'
import { ufOptions } from '@/lib/uf'
import { useMunicipios } from '@/services/api/use-municipios'
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

interface SimilarResultsSwitchProps {
  module?: Module
}

/**
 * Alternador "Mostrar resultados semelhantes": desligado por padrão, mantém a
 * busca por nome exato (`exact=true`). Ligado, inclui cursos com nome parecido.
 */
function SimilarResultsSwitch({ module }: SimilarResultsSwitchProps) {
  const { updateParams } = useSearchCursos()
  const searchParams = useSearchParams()
  const labelId = useId()
  const hintId = useId()

  const exact = searchParams?.get('exact') !== 'false'
  const showSimilar = !exact

  const handleChange = (value: boolean) => {
    updateParams({ exact: value ? 'false' : 'true', page: '1' })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <Typo s="sm" t="span" id={labelId} className="text-fg">
          Mostrar resultados semelhantes
        </Typo>
        <Switch
          size="sm"
          module={module}
          checked={showSimilar}
          aria-labelledby={labelId}
          aria-describedby={hintId}
          onCheckedChange={handleChange}
        />
      </div>
      <Typo s="xs" t="span" v="mute" id={hintId}>
        {showSimilar
          ? 'Também inclui cursos com nome parecido'
          : 'Retorna somente o curso com esse nome exato'}
      </Typo>
    </div>
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
    <FiltersPanel
      sections={SECTIONS}
      aggregations={aggregations}
      activeValues={getActiveValues}
      onToggle={onToggle}
      onApply={onApply}
      onClear={resetFilters}
      leading={
        <div className="flex flex-col gap-6">
          <SortingOptionsCursos module={module} />
          <SimilarResultsSwitch module={module} />
        </div>
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
  )
}
