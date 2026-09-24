import { Suspense } from 'react'
import { ActiveFilters } from '@/components/cursos/active-filters/active-filters'
import { CourseFilters } from '@/components/cursos/course-filters/course-filters'
import { SearchHeaderBlock } from '@/components/cursos/search-header/search-header'
import SearchResultSection from '@/components/cursos/search-result/search-result-section'
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
        <SearchHeaderBlock />
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
            <CourseFilters />
          </Suspense>
        </aside>

        <main className="md:col-span-3 space-y-4">
          <Suspense fallback={null}>
            <ActiveFilters />
          </Suspense>

          <Suspense
            fallback={
              <Typo v="mute" s="sm">
                Carregando resultados...
              </Typo>
            }
          >
            <SearchResultSection />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
