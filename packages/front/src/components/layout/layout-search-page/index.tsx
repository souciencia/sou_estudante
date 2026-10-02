import { type ReactNode, Suspense } from 'react'
import { BussolaHero } from '@/components/layout/hero/bussola/bussola-hero'
import { RoutesBar } from '@/components/layout/routes-bar/routes-bar'
import { Typo } from '@/components/ui/typo'
import { MODULE_META, type Module } from '@/lib/module'

interface LayoutSearchPageProps {
  title: string
  subtitle?: string
  searchLabel?: string
  module?: Module
  searchHeader: ReactNode
  activeFilters: ReactNode
  filtersPanel: ReactNode
  toolbar: ReactNode
  results: ReactNode
}

/**
 * Moldura agnóstica das páginas de busca: barra de rotas, título, cabeçalho de
 * busca, filtros ativos, painel de filtros, barra de ferramentas dos resultados
 * e resultados. As partes de domínio entram por slots, preenchidos pelos
 * wrappers `LayoutSearchPageCursos`/`LayoutSearchPageIes`.
 */
export function LayoutSearchPage({
  title,
  subtitle,
  searchLabel = 'Buscar',
  module,
  searchHeader,
  activeFilters,
  filtersPanel,
  toolbar,
  results,
}: LayoutSearchPageProps) {
  const badge = module ? MODULE_META[module].badge : undefined

  return (
    <div className="bg-site-background" data-module={module}>
      <RoutesBar module={module} />

      <div className="mx-auto w-full max-w-pages px-5 py-8">
        <header className="mb-6">
          {badge && (
            <div className="mb-2 flex items-center gap-2 font-coadjuvant text-coadjuvant-xs font-bold uppercase tracking-[0.9px] text-accent-deep">
              <BussolaHero className="size-4" aria-hidden />
              {badge}
            </div>
          )}

          <h1 className="block font-display text-[clamp(2rem,4vw,2.75rem)] font-normal leading-[1.1] text-fg-protagonist">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1.5 font-protagonist text-protagonist text-fg-muted">
              {subtitle}
            </p>
          )}
        </header>

        <div className="mb-2 font-coadjuvant text-coadjuvant-xs font-bold uppercase tracking-[0.9px] text-accent-deep">
          {searchLabel}
        </div>

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
    </div>
  )
}
