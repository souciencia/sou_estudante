'use client'

import { useSearchParams } from 'next/navigation'
import {
  MAX_COMPARE,
  useCompareCursos,
} from '@/components/compare/compare-provider'
import { SearchResults } from '@/components/search/search-results/search-results'
import type { Module } from '@/lib/module'
import type { Curso } from '@/services/api/types'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { SearchResultItem } from './search-result-item'
import { SearchResultsCursosSummary } from './search-results-cursos-summary'

interface SearchResultsCursosProps {
  module?: Module
}

export function SearchResultsCursos({ module }: SearchResultsCursosProps) {
  const {
    results,
    isLoading,
    error,
    total,
    currentPage,
    limit,
    links,
    navigateToPage,
  } = useSearchCursos()
  const { ids, isComparing, isSelected, toggle } = useCompareCursos()
  const searchParams = useSearchParams()
  const to = searchParams?.get('to') ?? undefined

  const selectionFull = ids.length >= MAX_COMPARE

  return (
    <SearchResults<Curso>
      items={results}
      isLoading={isLoading}
      error={error}
      total={total}
      currentPage={currentPage}
      limit={limit}
      links={links}
      onNavigate={navigateToPage}
      labels={{ singular: 'curso', plural: 'cursos' }}
      emptyMessage="Nenhum curso encontrado"
      showCount={false}
      footer={<SearchResultsCursosSummary />}
      getItemKey={(curso, index) =>
        curso.sequencial
          ? `seq-${curso.sequencial}`
          : `${curso.instituicao?.co_ies}-${curso.curso?.co_curso}-${index}`
      }
      renderItem={(curso) => {
        const id = curso.sequencial
        const selected = id !== undefined && isSelected(String(id))

        return (
          <SearchResultItem
            curso={curso}
            module={module}
            comparing={isComparing}
            selected={selected}
            disabled={id !== undefined && !selected && selectionFull}
            onToggle={toggle}
            to={to}
          />
        )
      }}
      module={module}
    />
  )
}
