'use client'

import { useSearchParams } from 'next/navigation'
import { useId } from 'react'
import { Switch } from '@/components/atoms/switch'
import { Typo } from '@/components/atoms/typo'
import { SearchAutocomplete } from '@/components/features/search-autocomplete/search-autocomplete'
import { SearchSortignOptions } from '@/components/features/search-sorting-options/search-sorting-options'
import { useSearchCursos } from '@/services/api/use-search-cursos'

function isExactEnabled(searchParams: URLSearchParams | null): boolean {
  const raw = searchParams?.get('exact')
  return raw === null || raw === '' || raw !== 'false'
}

export function SearchHeaderBlock() {
  const { query, setQuery, updateParams } = useSearchCursos()
  const searchParams = useSearchParams()
  const exact = isExactEnabled(searchParams)
  const exactLabelId = useId()
  const exactHintId = useId()

  const handleExactChange = (value: boolean) => {
    updateParams({ exact: value ? 'true' : 'false', page: '1' })
  }

  return (
    <div className="rounded-md border p-2">
      <SearchAutocomplete defaultValue={query} onSearchSubmit={setQuery} />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Typo
            s="sm"
            t="span"
            id={exactLabelId}
            className="cursor-auto text-gray-700"
          >
            Busca exata
          </Typo>
          <Switch
            size="sm"
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
      </div>

      <div className="my-4 border-t border-gray-200 pt-4">
        <SearchSortignOptions />
      </div>
    </div>
  )
}
