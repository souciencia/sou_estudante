'use client'

import { useSearchParams } from 'next/navigation'
import {
  type FilterSectionDefinition,
  FiltersPanel,
} from '@/components/filters-panel/filters-panel'
import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'

const ESTADOS_PRINCIPAIS = [
  { label: 'São Paulo', value: 'SP' },
  { label: 'Bahia', value: 'BA' },
  { label: 'Rio de Janeiro', value: 'RJ' },
]

const OUTROS_ESTADOS = [
  { label: 'Minas Gerais', value: 'MG' },
  { label: 'Paraná', value: 'PR' },
  { label: 'Rio Grande do Sul', value: 'RS' },
  { label: 'Pernambuco', value: 'PE' },
  { label: 'Ceará', value: 'CE' },
  { label: 'Santa Catarina', value: 'SC' },
  { label: 'Goiás', value: 'GO' },
  { label: 'Distrito Federal', value: 'DF' },
]

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

const CATEGORIAS = [
  { label: 'Federal', value: 'Federal' },
  { label: 'Estadual', value: 'Estadual' },
  { label: 'Municipal', value: 'Municipal' },
  { label: 'Privada', value: 'Privada' },
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
]

const SECTIONS: FilterSectionDefinition[] = [
  {
    key: 'uf',
    title: 'Estado',
    aggregationKey: 'ufs',
    options: [...ESTADOS_PRINCIPAIS, ...OUTROS_ESTADOS],
    visibleCount: ESTADOS_PRINCIPAIS.length,
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
    options: CATEGORIAS,
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
]

interface CourseFiltersProps {
  module?: Module
  className?: string
}

export function CourseFilters({ module, className }: CourseFiltersProps) {
  const searchParams = useSearchParams()
  const { updateParams, aggregations } = useSearchCursos()

  const getActiveValues = (key: string): string[] => {
    const raw = searchParams?.get(key)
    if (!raw) return []
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const handleToggle = (key: string, value: string) => {
    const activeValues = getActiveValues(key)
    const exists = activeValues.includes(value)
    const newValues = exists
      ? activeValues.filter((v) => v !== value)
      : [...activeValues, value]

    updateParams({
      [key]: newValues.length > 0 ? newValues.join(',') : null,
      page: '1',
    })
  }

  return (
    <FiltersPanel
      sections={SECTIONS}
      aggregations={aggregations}
      activeValues={getActiveValues}
      onToggle={handleToggle}
      module={module}
      className={className}
    />
  )
}
