import { type ReactNode, Suspense } from 'react'
import { RoutesBar } from '@/components/layout/routes-bar/routes-bar'
// Dependência deliberada de `search/`: o layout da página de busca precisa saber
// se há um termo em `q` (SearchGate) para decidir entre os blocos e o estado vazio.
import { SearchGate } from '@/components/search/search-gate/search-gate'
import { IconModule } from '@/components/ui/icon-module/icon-module'
import { Typo } from '@/components/ui/typo'
import { MODULE_META, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'

const DEFAULT_EMPTY_PROMPT = 'Faça uma busca para ver os resultados'

interface LayoutSearchPageProps {
  module?: Module
  searchLabel?: string
  searchHeader?: ReactNode
  activeFilters?: ReactNode
  filtersPanel?: ReactNode
  toolbar?: ReactNode
  /** Resumo dos resultados (ex.: contagem + tag), exibido ao lado da ordenação. */
  resultsSummary?: ReactNode
  results?: ReactNode
  /** Entrada de busca exibida entre o cabeçalho e o aviso (ex.: redireciona para outra busca). */
  searchEntry?: ReactNode
  /** Aviso exibido abaixo do cabeçalho enquanto nenhuma busca foi realizada. */
  notice?: ReactNode
  /** Mínimo de caracteres em `q` para considerar que houve busca. */
  minQueryLength?: number
  /** Mensagem exibida enquanto nenhuma busca foi realizada. */
  emptyPrompt?: ReactNode
}

export function LayoutSearchPage({
  module,
  searchLabel = 'Buscar',
  searchHeader,
  activeFilters,
  filtersPanel,
  toolbar,
  resultsSummary,
  results,
  searchEntry,
  notice,
  minQueryLength,
  emptyPrompt,
}: LayoutSearchPageProps) {
  const meta = module ? MODULE_META[module] : undefined
  const hasSearch = Boolean(searchHeader)
  const hasResults = Boolean(
    filtersPanel || toolbar || resultsSummary || results,
  )
  const showPrompt = hasSearch || hasResults

  return (
    <div data-module={module} className="min-h-screen">
      <div className="mx-auto w-full max-w-pages px-5 min-h-page bg-surface-lv1 rounded-b-callout">
        <RoutesBar module={module} />
        {meta && module && (
          <header className="mb-6 mt-6">
            <div className="mb-2 flex items-center gap-2 font-sans text-xs font-bold tracking-[0.9px] text-accent-deep uppercase">
              <IconModule module={module} />
              {meta.badge}
            </div>

            <h1 className="block font-sans text-display font-bold leading-[1.08] tracking-[-0.02em] text-fg">
              {meta.page.lead}{' '}
              <em className="font-bold text-accent-deep italic">
                {meta.page.accent}
              </em>
            </h1>

            <p className="mt-1.5 font-sans text-base text-fg-muted">
              {meta.page.subtitle}
            </p>
          </header>
        )}

        {searchEntry && <div className="mb-6">{searchEntry}</div>}

        {hasSearch && (
          <>
            <div className="mb-2 font-sans text-xs font-bold tracking-[0.9px] text-accent-deep uppercase">
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
          </>
        )}

        {notice && (
          <Suspense fallback={<div className="mb-6 mt-6">{notice}</div>}>
            <SearchGate fallback={<div className="mb-6 mt-6">{notice}</div>}>
              {null}
            </SearchGate>
          </Suspense>
        )}

        {showPrompt && (
          <SearchRegion
            minQueryLength={minQueryLength}
            fallback={
              <div className="py-8 text-center">
                <Typo v="mute" s="sm" t="p">
                  {emptyPrompt ?? DEFAULT_EMPTY_PROMPT}
                </Typo>
              </div>
            }
          >
            {hasSearch && <Suspense fallback={null}>{activeFilters}</Suspense>}

            {hasResults && (
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-7">
                {filtersPanel && (
                  <aside className="md:col-span-2">
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

                <div
                  className={cn('space-y-4', {
                    'md:col-span-5': Boolean(filtersPanel),
                    'md:col-span-7': !filtersPanel,
                  })}
                >
                  {(resultsSummary || toolbar) && (
                    <div className="flex items-center justify-between">
                      {resultsSummary && (
                        <Suspense fallback={null}>{resultsSummary}</Suspense>
                      )}
                      {toolbar && (
                        <Suspense fallback={null}>{toolbar}</Suspense>
                      )}
                    </div>
                  )}

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
                </div>
              </div>
            )}
          </SearchRegion>
        )}
      </div>
    </div>
  )
}

interface SearchRegionProps {
  minQueryLength?: number
  fallback: ReactNode
  children: ReactNode
}

/**
 * Decide se a região de busca (filtros, ordenação e resultados) deve aparecer:
 * só depois de haver um termo em `q` na URL (via `SearchGate`).
 */
function SearchRegion({
  minQueryLength,
  fallback,
  children,
}: SearchRegionProps) {
  return (
    <Suspense fallback={fallback}>
      <SearchGate minQueryLength={minQueryLength} fallback={fallback}>
        {children}
      </SearchGate>
    </Suspense>
  )
}
