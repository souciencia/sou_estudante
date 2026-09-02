// components/organisms/course-filters.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Typo } from '@/components/atoms/typo'
import { FilterGroup } from '@/components/molecules/filter-group'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { cn } from '@/utils/cn'

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

interface CourseFiltersProps {
  className?: string
}

export function CourseFilters({ className }: CourseFiltersProps) {
  const searchParams = useSearchParams()
  const { updateParams } = useSearchCursos()
  const [showAllEstados, setShowAllEstados] = useState(false)

  const getActiveValues = (key: string): string[] => {
    const raw = searchParams?.get(key)
    if (!raw) return []
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const isChecked = (key: string, value: string) => {
    return getActiveValues(key).includes(value)
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

  const estados = showAllEstados
    ? [...ESTADOS_PRINCIPAIS, ...OUTROS_ESTADOS]
    : ESTADOS_PRINCIPAIS

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <FilterGroup>
        <FilterGroup.Title>Estado</FilterGroup.Title>
        <FilterGroup.List>
          {estados.map((item) => (
            <FilterGroup.Option
              key={item.value}
              label={item.label}
              value={item.value}
              checked={isChecked('uf', item.value)}
              onChange={() => handleToggle('uf', item.value)}
            />
          ))}
        </FilterGroup.List>
        <button
          type="button"
          onClick={() => setShowAllEstados(!showAllEstados)}
          className={cn(
            'mt-2 text-left text-sm text-blue-600 hover:underline cursor-pointer',
          )}
        >
          <Typo s="sm" className={cn('text-blue-600')}>
            {showAllEstados
              ? 'Ver menos estados'
              : `+ ${OUTROS_ESTADOS.length} estados`}
          </Typo>
        </button>
      </FilterGroup>

      <FilterGroup>
        <FilterGroup.Title>Turno · Censo</FilterGroup.Title>
        <FilterGroup.List>
          {TURNOS.map((item) => (
            <FilterGroup.Option
              key={item.value}
              label={item.label}
              value={item.value}
              checked={isChecked('turno', item.value)}
              onChange={() => handleToggle('turno', item.value)}
            />
          ))}
        </FilterGroup.List>
      </FilterGroup>

      <FilterGroup>
        <FilterGroup.Title>Grau acadêmico</FilterGroup.Title>
        <FilterGroup.List>
          {GRAUS_ACADEMICOS.map((item) => (
            <FilterGroup.Option
              key={item.value}
              label={item.label}
              value={item.value}
              checked={isChecked('grau', item.value)}
              onChange={() => handleToggle('grau', item.value)}
            />
          ))}
        </FilterGroup.List>
      </FilterGroup>

      <FilterGroup>
        <FilterGroup.Title>Categoria</FilterGroup.Title>
        <FilterGroup.List>
          {CATEGORIAS.map((item) => (
            <FilterGroup.Option
              key={item.value}
              label={item.label}
              value={item.value}
              checked={isChecked('categoria', item.value)}
              onChange={() => handleToggle('categoria', item.value)}
            />
          ))}
        </FilterGroup.List>
      </FilterGroup>

      <FilterGroup>
        <FilterGroup.Title>Modalidade</FilterGroup.Title>
        <FilterGroup.List>
          {MODALIDADES.map((item) => (
            <FilterGroup.Option
              key={item.value}
              label={item.label}
              value={item.value}
              checked={isChecked('modalidade', item.value)}
              onChange={() => handleToggle('modalidade', item.value)}
            />
          ))}
        </FilterGroup.List>
      </FilterGroup>

      <FilterGroup>
        <FilterGroup.Title>Conceito Enade</FilterGroup.Title>
        <FilterGroup.List>
          {CONCEITOS_ENADE.map((item) => (
            <FilterGroup.Option
              key={item.value}
              label={item.label}
              value={item.value}
              checked={isChecked('enade', item.value)}
              onChange={() => handleToggle('enade', item.value)}
            />
          ))}
        </FilterGroup.List>
      </FilterGroup>
    </div>
  )
}
