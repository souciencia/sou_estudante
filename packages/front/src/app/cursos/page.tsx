import { LayoutSearchPage } from '@/components/layout/layout-search-page'
import { ActiveFiltersCursos } from '@/components/search/active-filters/wrappers/active-filters-cursos/active-filters-cursos'
import { FiltersPanelCursos } from '@/components/search/filters-panel/wrappers/filters-panel-cursos/filters-panel-cursos'
import { SearchHeaderCursos } from '@/components/search/search-header/wrappers/search-header-cursos/search-header-cursos'
import SearchResultSectionCursos from '@/components/search/search-result-section/wrappers/search-result-section-cursos/search-result-section-cursos'
import { SortingOptionsCursos } from '@/components/search/sorting-options/wrappers/sorting-options-cursos/sorting-options-cursos'
import type { Module } from '@/lib/module'

const module: Module = '1'

export default function CursosPage() {
  return (
    <LayoutSearchPage
      searchLabel="Buscar curso"
      module={module}
      searchHeader={<SearchHeaderCursos module={module} />}
      activeFilters={<ActiveFiltersCursos module={module} />}
      filtersPanel={<FiltersPanelCursos module={module} />}
      toolbar={<SortingOptionsCursos module={module} />}
      results={<SearchResultSectionCursos module={module} />}
    />
  )
}
