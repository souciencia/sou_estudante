'use client'

import { Tag } from '@/components/ui/tag/tag'
import { Typo } from '@/components/ui/typo'
import { getAggregationCount } from '@/lib/aggregations'
import type { Module } from '@/lib/module'
import { useSearchCursos } from '@/services/api/use-search-cursos'

interface SearchResultsCursosSummaryProps {
  module?: Module
}

/**
 * Contagem de cursos encontrados e tag de gratuitos, lidos diretamente do
 * `useSearchCursos`. Não renderiza nada enquanto não houver resultados.
 */
export function SearchResultsCursosSummary({
  module,
}: SearchResultsCursosSummaryProps) {
  const { results, total, aggregations } = useSearchCursos()

  if (results.length === 0) {
    return null
  }

  const gratuitos =
    getAggregationCount(aggregations, 'ingresso', 'gratuito') ?? 0
  const value = total > 0 ? total : results.length
  const text =
    value === 1 ? '1 curso encontrado' : `${value} cursos encontrados`

  return (
    <div className="flex items-center gap-2">
      <Typo v="mute" s="sm" t="p">
        {text}
      </Typo>
      {gratuitos > 0 && (
        <Tag
          label={`${gratuitos} ${gratuitos === 1 ? 'gratuito' : 'gratuitos'}`}
          module={module}
        />
      )}
    </div>
  )
}
