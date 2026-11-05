'use client'

import { useQueries } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SkeletonCard } from '@/components/ui/card/skeleton-card'
import { ErrorMessage } from '@/components/ui/error-message'
import { Typo } from '@/components/ui/typo'
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
  const { ids, toggle, setComparing } = useCompareCursos()
  const router = useRouter()

  const handleBuscarCursos = () => {
    setComparing(true)
    router.push('/cursos')
  }

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
    return (
      <div className="rounded-card border border-border-primary bg-surface-lv2 p-8 text-center">
        <Typo v="title" s="lg" t="h2" className="block">
          Nenhum curso selecionado
        </Typo>
        <Typo v="mute" s="sm" t="p" className="mt-2">
          Volte à busca, ative a comparação e selecione os cursos que você quer
          colocar lado a lado.
        </Typo>
        <button
          type="button"
          onClick={handleBuscarCursos}
          className="mt-6 inline-block cursor-pointer rounded-full border border-accent bg-accent px-5 py-2 font-sans text-sm font-bold text-accent-fg shadow-md transition duration-300 hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
        >
          Buscar cursos
        </button>
      </div>
    )
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
