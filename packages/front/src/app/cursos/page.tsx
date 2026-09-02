// src/app/cursos/page.tsx
import { Suspense } from 'react'
import { Typo } from '@/components/atoms/typo'
import { ActiveFilters } from '@/components/molecules/active-filters'
import { CourseFilters } from '@/components/organisms/course-filters'
import { SearchFilters } from '@/components/organisms/search-filters'
import SearchResultSection from '@/components/organisms/search-result-section'

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
        <SearchFilters />
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
