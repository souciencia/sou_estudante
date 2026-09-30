import { LayoutSearchPage } from '@/components/layout/layout-search-page'
import { ActiveFiltersCursos } from '@/components/search/active-filters/wrappers/active-filters-cursos/active-filters-cursos'
import { FiltersPanelCursos } from '@/components/search/filters-panel/wrappers/filters-panel-cursos/filters-panel-cursos'
import { SearchHeaderCursos } from '@/components/search/search-header/wrappers/search-header-cursos/search-header-cursos'
import SearchResultSectionCursos from '@/components/search/search-result-section/wrappers/search-result-section-cursos/search-result-section-cursos'
import type { Module } from '@/lib/module'

interface LayoutSearchPageCursosProps {
  module?: Module
}

/**
 * Especialização de `LayoutSearchPage` para a busca de cursos.
 */
export function LayoutSearchPageCursos({
  module,
}: LayoutSearchPageCursosProps) {
  return (
    <LayoutSearchPage
      title="Busca de Cursos"
      module={module}
      searchHeader={<SearchHeaderCursos module={module} />}
      filtersPanel={<FiltersPanelCursos module={module} />}
      activeFilters={<ActiveFiltersCursos module={module} />}
      results={<SearchResultSectionCursos module={module} />}
    />
  )
}
