import { type ReactNode, Suspense } from 'react'
import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'

interface LayoutSearchPageProps {
  title: string
  module?: Module
  searchHeader: ReactNode
  filtersPanel: ReactNode
  activeFilters: ReactNode
  results: ReactNode
}

/**
 * Moldura agnóstica das páginas de busca: título, cabeçalho de busca, painel
 * de filtros, filtros ativos e resultados. As partes de domínio entram por
 * slots, preenchidos pelos wrappers `LayoutSearchPageCursos`/`LayoutSearchPageIes`.
 */
export function LayoutSearchPage({
  title,
  module,
  searchHeader,
  filtersPanel,
  activeFilters,
  results,
}: LayoutSearchPageProps) {
  return (
    <div className="container mx-auto py-8 max-w-[900px]" data-module={module}>
      <Typo v="title" s="2xl" t="h1" className="mb-6 block">
        {title}
      </Typo>

      <Suspense
        fallback={
          <Typo v="mute" s="sm">
            Carregando busca...
          </Typo>
        }
      >
        {searchHeader}
      </Suspense>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Suspense
            fallback={
              <Typo v="mute" s="sm">
                Carregando filtros...
              </Typo>
            }
          >
            {filtersPanel}
          </Suspense>
        </aside>

        <main className="md:col-span-3 space-y-4">
          <Suspense fallback={null}>{activeFilters}</Suspense>

          <Suspense
            fallback={
              <Typo v="mute" s="sm">
                Carregando resultados...
              </Typo>
            }
          >
            {results}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
