'use client'

import { Typo } from '@/components/ui/typo'
import { useSearchIes } from '@/services/api/use-search-ies'

/**
 * Contagem de instituições encontradas, lida diretamente do `useSearchIes`.
 * Não renderiza nada enquanto não houver resultados.
 */
export function SearchResultsIesSummary() {
  const { results, total } = useSearchIes()

  if (results.length === 0) {
    return null
  }

  const value = total > 0 ? total : results.length
  const text =
    value === 1
      ? '1 instituição encontrada'
      : `${value} instituições encontradas`

  return (
    <Typo v="mute" s="sm" t="p">
      {text}
    </Typo>
  )
}
