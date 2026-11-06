import { Info } from 'lucide-react'
import { LayoutSearchPage } from '@/components/layout/layout-search-page'
import { ActiveFiltersIes } from '@/components/search/active-filters/wrappers/active-filters-ies/active-filters-ies'
import { FiltersPanelIes } from '@/components/search/filters-panel/wrappers/filters-panel-ies/filters-panel-ies'
import { SearchHeaderIes } from '@/components/search/search-header/wrappers/search-header-ies/search-header-ies'
import { SearchResultsIes } from '@/components/search/search-results/wrappers/search-results-ies/search-results-ies'
import { Callout } from '@/components/ui/callout'
import type { Module } from '@/lib/module'

const module: Module = '4'

export default function IesPage() {
  return (
    <LayoutSearchPage
      searchLabel="Buscar instituição"
      module={module}
      searchHeader={<SearchHeaderIes module={module} />}
      activeFilters={<ActiveFiltersIes module={module} />}
      filtersPanel={<FiltersPanelIes module={module} />}
      results={<SearchResultsIes module={module} />}
      emptyPrompt="Busque uma instituição para ver os resultados"
      notice={
        <Callout v="blue">
          <Callout.Header>
            <Callout.Icon>
              <Info aria-hidden="true" />
            </Callout.Icon>
            <Callout.HeaderContent>
              <Callout.Tagline>Para você, estudante</Callout.Tagline>
              <Callout.Title>Os números dão contexto.</Callout.Title>
            </Callout.HeaderContent>
          </Callout.Header>
          <Callout.Content>
            <p>
              Aqui você encontra um retrato da instituição: quantos estudantes estão 
              matriculados na graduação, quantos cursos ela oferece e como se compõe seu corpo docente.
            </p>
            <p>
              Essas informações ajudam a conhecer o perfil da instituição, mas não dizem, 
              sozinhas, como será a experiência em um curso específico. Para conhecer melhor 
              o curso que você pretende fazer, consulte também as informações da Carta Náutica.
            </p>
            <p>
              Os dados vêm do Censo da Educação Superior, com o ano de referência sempre indicado.
            </p>
          </Callout.Content>
          <Callout.Footer>
            — SoU_Estudante · SoU_Ciência / Unifesp · Censo da Educação Superior
          </Callout.Footer>
        </Callout>
      }
    />
  )
}
