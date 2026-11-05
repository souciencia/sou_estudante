'use client'

import { Typo } from '@/components/ui/typo'
import { useSearchCursos } from '@/services/api/use-search-cursos'

/**
 * Contagem de cursos encontrados, lida diretamente do `useSearchCursos`.
 * Não renderiza nada enquanto não houver resultados.
 */
export function SearchResultsCursosSummary() {
  const { results, total } = useSearchCursos()

  if (results.length === 0) {
    return null
  }

  const value = total > 0 ? total : results.length
  const text =
    value === 1 ? '1 curso encontrado' : `${value} cursos encontrados`

  return (
    <Typo v="mute" s="sm" t="p">
      {text}
    </Typo>
  )
}
