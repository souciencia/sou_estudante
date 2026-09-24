'use client'

import { useSearchParams } from 'next/navigation'
import { useId } from 'react'
import { SearchHeader } from '@/components/search/search-header'
import { SortingOptionsCursos } from '@/components/search/sorting-options/wrappers/sorting-options-cursos/sorting-options-cursos'
import { Switch } from '@/components/ui/switch/switch'
import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'

function isExactEnabled(searchParams: URLSearchParams | null): boolean {
  const raw = searchParams?.get('exact')
  return raw === null || raw === '' || raw !== 'false'
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
        defaultValue={query}
        onSearchSubmit={setQuery}
      />

      <SearchHeader.Actions>
        <div className="flex items-center gap-2">
          <Typo
            s="sm"
            t="span"
            id={exactLabelId}
            className="cursor-auto text-fg-coadjuvant"
          >
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
        <Typo s="xs" t="span" v="mute" id={exactHintId} className="cursor-auto">
          {exact
            ? 'Retorna somente o curso com esse nome exato'
            : 'Também inclui cursos com nome parecido'}
        </Typo>
      </SearchHeader.Actions>

      <SearchHeader.Sorting>
        <SortingOptionsCursos module={module} />
      </SearchHeader.Sorting>
    </SearchHeader>
  )
}
