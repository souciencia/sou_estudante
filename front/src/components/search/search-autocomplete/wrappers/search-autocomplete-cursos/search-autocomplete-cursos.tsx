'use client'

import {
  SearchAutocomplete,
  type SearchAutocompleteProps,
} from '@/components/search/search-autocomplete/search-autocomplete'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'

/** Hook e textos do autocomplete de cursos, reaproveitáveis por outros blocos. */
export const searchAutocompleteCursosConfig = {
  useSuggestions: useSugestoesCursos,
  placeholder: 'Busque pelo nome do curso',
  searchLabel: 'Buscar curso pelo nome',
  listLabel: 'Sugestões de cursos',
} satisfies Pick<
  SearchAutocompleteProps,
  'useSuggestions' | 'placeholder' | 'searchLabel' | 'listLabel'
>

export type SearchAutocompleteCursosProps = Omit<
  SearchAutocompleteProps,
  keyof typeof searchAutocompleteCursosConfig
> &
  Partial<Pick<SearchAutocompleteProps, 'placeholder'>>

/** Autocomplete do domínio Cursos sobre o `SearchAutocomplete` agnóstico. */
export function SearchAutocompleteCursos(props: SearchAutocompleteCursosProps) {
  return <SearchAutocomplete {...searchAutocompleteCursosConfig} {...props} />
}
