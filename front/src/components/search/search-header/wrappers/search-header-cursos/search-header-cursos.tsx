'use client'

import { useSearchParams } from 'next/navigation'
import { useId } from 'react'
import { CompareToggle } from '@/components/compare/compare-toggle'
import { searchAutocompleteCursosConfig } from '@/components/search/search-autocomplete/wrappers/search-autocomplete-cursos/search-autocomplete-cursos'
import { SearchHeader } from '@/components/search/search-header'
import { Switch } from '@/components/ui/switch/switch'
import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'

function isExactEnabled(searchParams: URLSearchParams | null): boolean {
  const raw = searchParams?.get('exact')
  return raw !== 'false'
}

interface SearchHeaderCursosProps {
  module?: Module
}

export function SearchHeaderCursos({ module }: SearchHeaderCursosProps) {
  const { query, setQuery, updateParams } = useSearchCursos()
  const searchParams = useSearchParams()
  const exact = isExactEnabled(searchParams)
  const exactLabelId = useId()
  const exactHintId = useId()

  const handleExactChange = (value: boolean) => {
    updateParams({ exact: value ? 'true' : 'false', page: '1' })
  }

  return (
    <SearchHeader module={module}>
      <SearchHeader.Autocomplete
        {...searchAutocompleteCursosConfig}
        defaultValue={query}
        onSearchSubmit={setQuery}
        placeholder="Ex.: Pedagogia, Enfermagem, Engenharia Civil…"
        submitLabel="Buscar"
      />

      <SearchHeader.Actions>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Typo s="sm" t="span" id={exactLabelId} className="text-fg">
              Busca exata
            </Typo>
            <Switch
              size="sm"
              module={module}
              checked={exact}
              aria-labelledby={exactLabelId}
              aria-describedby={exactHintId}
              onCheckedChange={handleExactChange}
            />
          </div>
          <CompareToggle module={module} />
        </div>
        <Typo s="xs" t="span" v="mute" id={exactHintId}>
          {exact
            ? 'Retorna somente o curso com esse nome exato'
            : 'Também inclui cursos com nome parecido'}
        </Typo>
      </SearchHeader.Actions>
    </SearchHeader>
  )
}
