import { CompareBar } from '@/components/compare/compare-bar'
import { LayoutSearchPage } from '@/components/layout/layout-search-page'
import { ActiveFiltersCursos } from '@/components/search/active-filters/wrappers/active-filters-cursos/active-filters-cursos'
import { FiltersPanelCursos } from '@/components/search/filters-panel/wrappers/filters-panel-cursos/filters-panel-cursos'
import { SearchHeaderCursos } from '@/components/search/search-header/wrappers/search-header-cursos/search-header-cursos'
import { SearchResultsCursos } from '@/components/search/search-results/wrappers/search-results-cursos/search-results-cursos'
import type { Module } from '@/lib/module'
import { API_CONFIG } from '@/services/api'

const module: Module = '1'

export default function CursosPage() {
  return (
    <LayoutSearchPage
      searchLabel="Buscar curso"
      module={module}
      searchHeader={<SearchHeaderCursos module={module} />}
      activeFilters={
        <>
          <ActiveFiltersCursos module={module} />
          <CompareBar module={module} />
        </>
      }
      filtersPanel={<FiltersPanelCursos module={module} />}
      results={<SearchResultsCursos module={module} />}
      minQueryLength={API_CONFIG.SEARCH_MIN_CHARS}
      emptyPrompt="Busque um curso para começar a explorar"
    />
  )
}
