import { type ReactNode, Suspense } from 'react'
import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'

interface LayoutSearchPageProps {
  title: string
  module?: Module
  searchHeader: ReactNode
  activeFilters: ReactNode
  filtersPanel: ReactNode
  toolbar: ReactNode
  results: ReactNode
}

/**
 * Moldura agnóstica das páginas de busca: título, cabeçalho de busca, filtros
 * ativos, painel de filtros, barra de ferramentas dos resultados e resultados.
 * As partes de domínio entram por slots, preenchidos pelos wrappers
 * `LayoutSearchPageCursos`/`LayoutSearchPageIes`.
 */
export function LayoutSearchPage({
  title,
  module,
  searchHeader,
  activeFilters,
  filtersPanel,
  toolbar,
  results,
}: LayoutSearchPageProps) {
  return (
    <div className="container mx-auto py-8 max-w-pages" data-module={module}>
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

      <Suspense fallback={null}>{activeFilters}</Suspense>

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
          <Suspense fallback={null}>{toolbar}</Suspense>

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
