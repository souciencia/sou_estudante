import { LayoutSearchPage } from '@/components/layout/layout-search-page'
import { ActiveFiltersIes } from '@/components/search/active-filters/wrappers/active-filters-ies/active-filters-ies'
import { FiltersPanelIes } from '@/components/search/filters-panel/wrappers/filters-panel-ies/filters-panel-ies'
import { SearchHeaderIes } from '@/components/search/search-header/wrappers/search-header-ies/search-header-ies'
import SearchResultSectionIes from '@/components/search/search-result-section/wrappers/search-result-section-ies/search-result-section-ies'
import type { Module } from '@/lib/module'

interface LayoutSearchPageIesProps {
  module?: Module
}

/**
 * Especialização de `LayoutSearchPage` para a busca de instituições.
 */
export function LayoutSearchPageIes({
  module = '4',
}: LayoutSearchPageIesProps) {
  return (
    <LayoutSearchPage
      title="Busca de Instituições"
      module={module}
      searchHeader={<SearchHeaderIes module={module} />}
      filtersPanel={<FiltersPanelIes module={module} />}
      activeFilters={<ActiveFiltersIes module={module} />}
      results={<SearchResultSectionIes module={module} />}
    />
  )
}
