# Diagrama do Frontend — Busca e Visualização de Cursos

Documentação do fluxo de dados, sincronização com URL, consumo da API e renderização de componentes no pacote `packages/front/`.

---

## 1. Visão Geral do Fluxo da Informação

O fluxo de busca no frontend conecta as ações do usuário na interface, a sincronização de estado com a URL do Next.js App Router, as chamadas HTTP tipadas à API Go e a renderização dos resultados e filtros.

```mermaid
flowchart TD
    User[Usuário] -->|digita termo de busca| SearchInput[SearchInput / SearchFilters]
    User -->|seleciona filtro| CourseFilters[CourseFilters / FilterGroup]
    User -->|altera ordenação| SearchOptions[SearchOptions]
    User -->|remove filtro| ActiveFilters[ActiveFilters]
    User -->|troca de página| Pagination[SearchPagination]

    SearchInput -->|setQuery| Hook[useSearchCursos Hook]
    CourseFilters -->|updateParams| Hook
    SearchOptions -->|updateParams| Hook
    ActiveFilters -->|updateParams / resetFilters| Hook
    Pagination -->|navigateToPage| Hook

    subgraph StateAndURL["Sincronização de Estado e URL"]
        Hook <-->|useSearchParams / useRouter.replace| URL[(URL SearchParams<br/>?q=...&page=...&uf=...&turno=...&sort=...)]
        Hook -->|useEffect quando query >= 5 chars| ServiceCall[cursoService.searchCursos]
    end

    subgraph ServiceLayer["Camada de Serviço e HTTP Client"]
        ServiceCall -->|monta URLSearchParams| Client[apiClient]
        Client -->|fetch GET /cursos?q=...| API[API Go Backend]
        API -->|JSON CursoListResponse| Client
        Client -->|Result: success ? data : emptyResponse| ServiceCall
        ServiceCall -->|CursoListResponse| Hook
    end

    subgraph ComponentTree["Renderização dos Componentes (/cursos)"]
        Hook -->|results: Curso[]| ResultList[SearchResultList]
        Hook -->|aggregations: SearchAggregations| CourseFilters
        Hook -->|links: PaginationLinks, total, limit| Pagination
        Hook -->|isLoading, error| ResultList

        ResultList -->|itera resultados| Item[SearchResultItem]
        Item --> CardRoot[Card]
        CardRoot --> CardHeader[Card.Header: Nome do Curso • Localização]
        CardRoot --> CardEnade[Card.IconEnade: Selo 1 a 5]
        CardRoot --> CardTags[Card.Tags: Gratuito, Modalidade, Turno, Grau]
        CardRoot --> CardProgress[Card.ProgressBar: Nota de Corte SISU]
    end
```

---

## 2. Camadas da Aplicação Frontend

```mermaid
graph LR
    subgraph UI["Camada de Apresentação (React / Next.js)"]
        Page["CursosPage (/app/cursos/page.tsx)"]
        Org["Organisms (CourseFilters, SearchResultSection, SearchResultList, SearchOptions)"]
        Mol["Molecules (ActiveFilters, FilterGroup, Card, SeloEnade)"]
        Atm["Atoms (SearchInput, Typo, Button, Tag, ProgressBar)"]
    end

    subgraph Hooks["Gerenciamento de Estado e URL"]
        Hook["useSearchCursos (use-search-cursos.ts)"]
    end

    subgraph Services["Camada de Integração com API"]
        Service["cursoService (curso.service.ts)"]
        HTTPClient["apiClient (client.ts)"]
        Config["API_CONFIG (config.ts)"]
    end

    Page --> Org
    Org --> Mol
    Mol --> Atm
    Org --> Hook
    Mol --> Hook
    Hook --> Service
    Service --> HTTPClient
    HTTPClient --> Config
```

---

## 3. Tipagem e Modelagem de Dados (`types.ts`)

A camada de tipos reflete a estrutura retornada pelo backend Go e provê contratos seguros para o consumo no React.

```mermaid
classDiagram
    class ApiResponse~T~ {
        +T[] results
    }

    class Result~T~ {
        <<discriminated union>>
        +bool success
        +T data
        +ApiError error
    }

    class ApiError {
        +ApiErrorType type
        +string message
        +number statusCode
        +unknown originalError
    }

    class CursoListResponse {
        +number total
        +number page
        +number limit
        +Curso[] results
        +PaginationLinks links
        +SearchAggregations aggregations
    }

    class PaginationLinks {
        +string self
        +string first
        +string prev
        +string next
        +string last
    }

    class SearchAggregations {
        +AggregationBucket[] ufs
        +AggregationBucket[] turnos
        +AggregationBucket[] graus
        +AggregationBucket[] categorias
        +AggregationBucket[] modalidades
        +AggregationBucket[] enades
    }

    class AggregationBucket {
        +string key
        +number count
    }

    class Curso {
        +number sequencial
        +number nu_ano_censo
        +string edicao
        +string dt_carga
        +Instituicao instituicao
        +DadosCurso curso
        +Localizacao localizacao
        +CensoMetricas censo_metricas
        +Enade enade
        +Tda tda
        +Sisu sisu
    }

    class Instituicao {
        +string co_ies
    }

    class DadosCurso {
        +string co_curso
        +string no_curso
        +number tp_dimensao
        +string tp_grau_academico
        +string no_grau_academico
        +boolean in_gratuito
        +string tp_modalidade_ensino
        +string no_modalidade_ensino
        +string tp_nivel_academico
        +string no_nivel_academico
        +Cine cine
    }

    class Cine {
        +string co_cine_rotulo
        +string no_cine_rotulo
        +string co_cine_area_geral
        +string no_cine_area_geral
        +string co_cine_area_especifica
        +string no_cine_area_especifica
        +string co_cine_area_detalhada
        +string no_cine_area_detalhada
    }

    class Localizacao {
        +string co_regiao
        +string no_regiao
        +string co_uf
        +string no_uf
        +string sg_uf
        +string co_municipio
        +string no_municipio
        +boolean in_capital
    }

    class CensoMetricas {
        +number qt_vg_total
        +number qt_vg_total_diurno
        +number qt_vg_total_noturno
        +number qt_vg_total_ead
        +number qt_ing
        +number qt_ing_prounii
        +number qt_ing_prounip
        +number qt_ing_fies
        +number qt_ing_rpfies
        +number qt_ing_nrpfies
        +number qt_ing_reserva_vaga
        +number qt_mat
        +number qt_apoio_social
        +number qt_mat_apoio_social
        +number qt_ativ_extracurricular
        +number qt_mat_ativ_extracurricular
    }

    class Enade {
        +number ano_enade
        +number conceito_continuo_enade
        +string conceito_faixa_enade
    }

    class Tda {
        +number nu_ano_ingresso_tda
        +number nu_ano_referencia_tda
        +number tap
        +number tca
        +number tda
    }

    class Sisu {
        +boolean tem_sisu
        +Oferta[] ofertas
    }

    class Oferta {
        +string municipio
        +string nome_municipio
        +string turno
        +string modalidade
        +number ordem_modalidade
        +string grupo
        +string descricao
        +number vagas
        +number nota_corte
        +number inscricoes
    }

    CursoListResponse --> PaginationLinks
    CursoListResponse --> Curso
    CursoListResponse --> SearchAggregations
    SearchAggregations --> AggregationBucket
    Curso --> Instituicao
    Curso --> DadosCurso
    Curso --> Localizacao
    Curso --> CensoMetricas
    Curso --> Enade
    Curso --> Tda
    Curso --> Sisu
    DadosCurso --> Cine
    Sisu --> Oferta
```

---

## 4. Funcionamento dos Hooks e Componentes

### 1. `useSearchCursos` (`use-search-cursos.ts`)
- **Sincronização com URL**: Lê os parâmetros de busca (`q`, `page`, `limit`, `uf`, `turno`, `grau`, `categoria`, `modalidade`, `enade`, `sort`) da URL via `useSearchParams` e atualiza a URL via `router.replace`.
- **Validação de Entrada**: Dispara a busca apenas quando o termo `q` possui pelo menos 5 caracteres (`API_CONFIG.SEARCH_MIN_CHARS = 5`).
- **Estados Expostos**:
  - `results: Curso[]`: Lista de cursos retornados.
  - `isLoading: boolean`: Indicador de requisição em andamento.
  - `error: string | null`: Mensagem de erro amigável caso ocorra falha.
  - `total: number`: Total de registros encontrados no Elasticsearch.
  - `links: PaginationLinks | null`: Links de paginação HATEOAS.
  - `aggregations: SearchAggregations | null`: Contadores por filtro para exibição dinâmica nas facetas.
- **Ações Expostas**: `setQuery`, `navigateToPage`, `updateParams`, `resetFilters`.

### 2. `CourseFilters` & `FilterGroup` (`course-filters.tsx`)
- Renderiza grupos colapsáveis e opções de filtro para **Estado**, **Turno**, **Grau Acadêmico**, **Categoria**, **Modalidade** e **Conceito ENADE**.
- Vincula dinamicamente a contagem de resultados (`resultCount`) usando os dados retornados em `aggregations` da API.

### 3. `ActiveFilters` (`active-filters.tsx`)
- Mapeia todos os filtros atualmente presentes na URL e exibe etiquetas (chips/badges) com botão para remoção individual ou limpeza global ("Limpar filtros").

### 4. `SearchResultItem` (`search-result-item.tsx`)
- Extrai e exibe os dados de cada item `Curso`:
  - Nome do curso e localização formatada (`Município - UF`).
  - Conceito ENADE no selo visual (`Card.IconEnade` / `SeloEnade`).
  - Tags dinâmicas: `Gratuito`, modalidade de ensino, turno e grau acadêmico.
  - Barra de progresso da nota de corte SISU (`Card.ProgressBar`) relativa à pontuação máxima (1000).
