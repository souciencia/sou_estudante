import { Suspense } from 'react'
import { ActiveFiltersCursos } from '@/components/search/active-filters/wrappers/active-filters-cursos/active-filters-cursos'
import { FiltersPanelCursos } from '@/components/search/filters-panel/wrappers/filters-panel-cursos/filters-panel-cursos'
import { SearchHeaderCursos } from '@/components/search/search-header/wrappers/search-header-cursos/search-header-cursos'
import SearchResultSectionCursos from '@/components/search/search-result-section/wrappers/search-result-section-cursos/search-result-section-cursos'
import { Typo } from '@/components/ui/typo'

export default function CursosPage() {
  return (
    <div className="container mx-auto py-8">
      <Typo v="title" s="2xl" t="h1" className="mb-6 block">
        Busca de Cursos
      </Typo>

      <Suspense
        fallback={
          <Typo v="mute" s="sm">
            Carregando busca...
          </Typo>
        }
      >
        <SearchHeaderCursos />
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
            <FiltersPanelCursos />
          </Suspense>
        </aside>

        <main className="md:col-span-3 space-y-4">
          <Suspense fallback={null}>
            <ActiveFiltersCursos />
          </Suspense>

          <Suspense
            fallback={
              <Typo v="mute" s="sm">
                Carregando resultados...
              </Typo>
            }
          >
            <SearchResultSectionCursos />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
