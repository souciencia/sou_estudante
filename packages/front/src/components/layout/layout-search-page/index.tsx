import { type ReactNode, Suspense } from 'react'
import { RoutesBar } from '@/components/layout/routes-bar/routes-bar'
import IconModule from '@/components/ui/icon-module/iconModule'
import { Typo } from '@/components/ui/typo'
import { MODULE_META, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'

interface LayoutSearchPageProps {
  module?: Module
  searchLabel?: string
  searchHeader?: ReactNode
  activeFilters?: ReactNode
  filtersPanel?: ReactNode
  toolbar?: ReactNode
  results?: ReactNode
}

export function LayoutSearchPage({
  module,
  searchLabel = 'Buscar',
  searchHeader,
  activeFilters,
  filtersPanel,
  toolbar,
  results,
}: LayoutSearchPageProps) {
  const meta = module ? MODULE_META[module] : undefined
  const hasSearch = Boolean(searchHeader)
  const hasResults = Boolean(filtersPanel || toolbar || results)

  return (
    <div className="bg-site-background" data-module={module}>
      <RoutesBar module={module} />

      <div className="mx-auto w-full max-w-pages px-5 py-8">
        {meta && module && (
          <header className="mb-6">
            <div className="mb-2 flex items-center gap-2 font-coadjuvant text-coadjuvant-xs font-bold tracking-[0.9px] text-accent-deep uppercase">
              <IconModule module={module} />
              {meta.badge}
            </div>

            <h1 className="block font-protagonist text-protagonist-2xl font-bold leading-[1.08] tracking-[-0.02em] text-fg-protagonist">
              {meta.page.lead}{' '}
              <em className="font-bold text-accent-deep italic">
                {meta.page.accent}
              </em>
            </h1>

            <p className="mt-1.5 font-protagonist text-protagonist text-fg-muted">
              {meta.page.subtitle}
            </p>
          </header>
        )}

        {hasSearch && (
          <>
            <div className="mb-2 font-coadjuvant text-coadjuvant-xs font-bold tracking-[0.9px] text-accent-deep uppercase">
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
          </>
        )}

        {hasResults && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
            {filtersPanel && (
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
            )}

            <main
              className={cn('space-y-4', {
                'md:col-span-3': Boolean(filtersPanel),
                'md:col-span-4': !filtersPanel,
              })}
            >
              {toolbar && <Suspense fallback={null}>{toolbar}</Suspense>}

              {results && (
                <Suspense
                  fallback={
                    <Typo v="mute" s="sm">
                      Carregando resultados...
                    </Typo>
                  }
                >
                  {results}
                </Suspense>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
