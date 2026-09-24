import { Suspense } from 'react'
import { IesActiveFilters } from '@/components/ies/ies-active-filters'
import { IesFilters } from '@/components/ies/ies-filters'
import IesResultSection from '@/components/ies/ies-result-section'
import { IesSearchHeader } from '@/components/ies/ies-search-header'
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
        <IesSearchHeader module="4" />
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
            <IesFilters module="4" />
          </Suspense>
        </aside>

        <main className="md:col-span-3 space-y-4">
          <Suspense fallback={null}>
            <IesActiveFilters module="4" />
          </Suspense>

          <Suspense
            fallback={
              <Typo v="mute" s="sm">
                Carregando resultados...
              </Typo>
            }
          >
            <IesResultSection module="4" />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
