'use client'

import { useQueries } from '@tanstack/react-query'
import { SkeletonCard } from '@/components/ui/card/skeleton-card'
import { ErrorMessage } from '@/components/ui/error-message'
import type { Module } from '@/lib/module'
import { cursoService } from '@/services/api/curso.service'
import { CompareMatrix } from './compare-matrix'
import { useCompareCursos } from './compare-provider'

interface CompararProps {
  module?: Module
}

function isNotFound(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    (error as { statusCode?: number }).statusCode === 404
  )
}

/**
 * Corpo da página /comparar: lê os cursos selecionados no `CompareProvider` e
 * os busca individualmente (React Query) para montar a matriz lado a lado.
 */
export function Comparar({ module }: CompararProps) {
  const { ids, toggle } = useCompareCursos()

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['resource', 'curso', id],
      queryFn: async () => {
        const result = await cursoService.getCurso(id)
        if (!result.success) throw result.error
        return result.data
      },
    })),
  })

  if (ids.length === 0) {
    return null
  }

  if (queries.some((query) => query.isPending)) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-label="Carregando comparação"
      >
        {ids.map((id) => (
          <SkeletonCard key={id} />
        ))}
      </div>
    )
  }

  const cursos = queries.map((query) => query.data ?? null)
  const hasError = queries.some(
    (query) => query.isError && !isNotFound(query.error),
  )

  return (
    <>
      {hasError && (
        <div className="mb-4">
          <ErrorMessage message="Não foi possível carregar um ou mais cursos selecionados." />
        </div>
      )}
      <CompareMatrix
        cursos={cursos}
        onRemove={(index) => toggle(ids[index])}
        module={module}
      />
    </>
  )
}
