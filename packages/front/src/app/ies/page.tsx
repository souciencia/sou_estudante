import { LayoutSearchPage } from '@/components/layout/layout-search-page'
import { ActiveFiltersIes } from '@/components/search/active-filters/wrappers/active-filters-ies/active-filters-ies'
import { FiltersPanelIes } from '@/components/search/filters-panel/wrappers/filters-panel-ies/filters-panel-ies'
import { SearchHeaderIes } from '@/components/search/search-header/wrappers/search-header-ies/search-header-ies'
import SearchResultSectionIes from '@/components/search/search-result-section/wrappers/search-result-section-ies/search-result-section-ies'
import { SortingOptionsIes } from '@/components/search/sorting-options/wrappers/sorting-options-ies/sorting-options-ies'
import type { Module } from '@/lib/module'

const module: Module = '1'

export default function IesPage() {
  return (
    <LayoutSearchPage
      searchLabel="Buscar instituição"
      module={module}
      searchHeader={<SearchHeaderIes module={module} />}
      activeFilters={<ActiveFiltersIes module={module} />}
      filtersPanel={<FiltersPanelIes module={module} />}
      toolbar={<SortingOptionsIes module={module} />}
      results={<SearchResultSectionIes module={module} />}
    />
  )
}
