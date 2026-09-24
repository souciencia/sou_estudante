import { Suspense } from 'react'
import { ActiveFiltersIes } from '@/components/search/active-filters/wrappers/active-filters-ies/active-filters-ies'
import { FiltersPanelIes } from '@/components/search/filters-panel/wrappers/filters-panel-ies/filters-panel-ies'
import { SearchHeaderIes } from '@/components/search/search-header/wrappers/search-header-ies/search-header-ies'
import SearchResultSectionIes from '@/components/search/search-result-section/wrappers/search-result-section-ies/search-result-section-ies'
import { Typo } from '@/components/ui/typo'

export default function IesPage() {
  return (
    <div className="container mx-auto py-8" data-module="4">
      <Typo v="title" s="2xl" t="h1" className="mb-6 block">
        Busca de Instituições
      </Typo>

      <Suspense
        fallback={
          <Typo v="mute" s="sm">
            Carregando busca...
          </Typo>
        }
      >
        <SearchHeaderIes module="4" />
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
            <FiltersPanelIes module="4" />
          </Suspense>
        </aside>

        <main className="md:col-span-3 space-y-4">
          <Suspense fallback={null}>
            <ActiveFiltersIes module="4" />
          </Suspense>

          <Suspense
            fallback={
              <Typo v="mute" s="sm">
                Carregando resultados...
              </Typo>
            }
          >
            <SearchResultSectionIes module="4" />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
