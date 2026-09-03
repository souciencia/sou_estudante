# Diagrama da API — Módulo de Cursos

Documentação arquitetural e de modelagem de dados do endpoint `GET /cursos`, implementado no pacote `packages/api/internal/features/cursos/`.

---

## 1. Visão Geral do Fluxo da Informação

O diagrama abaixo ilustra o ciclo de vida completo de uma requisição de busca de cursos, desde o cliente HTTP até a consulta e agregação no Elasticsearch.

```mermaid
flowchart TD
    Client[Cliente / Frontend] -->|"GET /cursos?q=termo&page=1&limit=20&uf=SP,RJ&turno=diurno&sort=enade"| CORS[middlewares.CorsMiddleware]
    CORS --> Handler

    subgraph Handler["handler.go — Handler.ServeHTTP"]
        H1["1. Validação de Método HTTP (somente GET)"]
        H2["2. Parse de Query Params:<br/>• q (obrigatório, min 1 char)<br/>• page (default 1), limit (default 20, max 100)<br/>• Filtros (slices): uf, turno, grau, categoria, modalidade, enade<br/>• Ordenação: sort (enade, desistencia, az, _score)"]
        H3["3. Cria Context com Timeout de 5s"]
        H4["4. Invoca Service.BuscarCursos(ctx, query, filters, page, limit)"]
        H5["5. Serializa CursoListResponse para JSON (HTTP 200 OK)"]
    end

    Handler --> H1 --> H2 --> H3 --> H4 --> H5

    H4 -->|"BuscarCursos"| Service

    subgraph Service["service.go — ServiceImpl.BuscarCursos"]
        S1["1. Validação de Regras de Negócio (query != '', page >= 1, 1 <= limit <= 100)"]
        S2["2. Invoca Repository.Search(ctx, query, filters, page, limit)"]
        S3["3. transformHitToCurso:<br/>Converte cada _source do ES para struct Curso<br/>(via marshal/unmarshal JSON seguro)"]
        S4["4. buildPaginationLinks:<br/>Gera URLs HATEOAS (self, first, prev, next, last)<br/>preservando termo de busca, ordenação e todos os filtros aplicados"]
        S5["5. Monta e retorna CursoListResponse (total, page, limit, results, links, aggregations)"]
    end

    Service --> S1 --> S2 --> S3 --> S4 --> S5

    S2 -->|"Search"| Repository

    subgraph Repository["repository.go — ElasticsearchRepository.Search"]
        R1["1. Cálculo de Paginação: from = (page - 1) * limit"]
        R2["2. Montagem de Cláusulas de Filtro (bool.filter):<br/>• UF: terms em localizacao.sg_uf.keyword<br/>• Grau: bool.should com match em curso.no_grau_academico<br/>• Modalidade: bool.should (Presencial/EaD)<br/>• Categoria: bool.should (in_gratuito + sisu.tem_sisu)<br/>• Enade: terms em enade.conceito_faixa_enade.keyword<br/>• Turno: bool.should (censo_metricas + sisu.ofertas.turno)"]
        R3["3. Montagem da Busca Textual (bool.must.multi_match):<br/>• curso.no_curso^3<br/>• curso.cine.no_cine_rotulo^2<br/>• localizacao.no_municipio, sg_uf, no_regiao<br/>• fuzziness: AUTO"]
        R4["4. Configuração de Ordenação (sort):<br/>enade: conceito_continuo_enade desc<br/>desistencia: tda.tda asc<br/>az: curso.no_curso.keyword asc<br/>default: _score desc"]
        R5["5. Configuração de Agregações (aggs):<br/>• terms aggs: ufs, graus, modalidades, enades<br/>• filters aggs: categorias, turnos"]
        R6["6. Execução HTTP contra Elasticsearch (track_total_hits: true)"]
        R7["7. Parse da Resposta (Hits + parser polimórfico de buckets array e map para SearchAggregations)"]
    end

    Repository --> R1 --> R2 --> R3 --> R4 --> R5 --> R6 --> R7
    R6 -->|"Query DSL JSON"| ES[(Elasticsearch<br/>Índice 'cursos')]
    ES -->|"Hits + Aggregations"| R6

    S5 -->|"CursoListResponse"| H5
    H5 -->|"200 OK (JSON)"| Client
```

---

## 2. Camadas e Arquitetura

A aplicação segue a convenção do projeto Go: `handlers → services → repository`.

```mermaid
graph LR
    subgraph Interfaces["Interfaces (Contratos)"]
        SVC["Service (service.go)<br/>BuscarCursos(...)"]
        REPO["Repository (repository.go)<br/>Search(...)"]
    end

    subgraph Implementacoes["Implementações"]
        SVCImpl["ServiceImpl (service.go)"]
        ESRepo["ElasticsearchRepository (repository.go)"]
    end

    subgraph Entrada["Camada HTTP"]
        Handler["Handler (handler.go)"]
        Mux["http.ServeMux /cursos (main.go)"]
    end

    Mux --> Handler
    Handler -->|usa| SVC
    SVCImpl -->|implementa| SVC
    SVCImpl -->|usa| REPO
    ESRepo -->|implementa| REPO
```

---

## 3. Modelagem de Dados (`models.go`)

### Diagrama de Classes e Estruturas

```mermaid
classDiagram
    class CursoListResponse {
        +int total
        +int page
        +int limit
        +[]Curso results
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

    class SearchFilterParams {
        +[]string uf
        +[]string turno
        +[]string grau
        +[]string categoria
        +[]string modalidade
        +[]string enade
        +string sort
    }

    class SearchAggregations {
        +[]AggregationBucket ufs
        +[]AggregationBucket turnos
        +[]AggregationBucket graus
        +[]AggregationBucket categorias
        +[]AggregationBucket modalidades
        +[]AggregationBucket enades
    }

    class AggregationBucket {
        +string key
        +int count
    }

    class Curso {
        +int64 sequencial
        +int nu_ano_censo
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
        +int tp_dimensao
        +string tp_grau_academico
        +string no_grau_academico
        +bool in_gratuito
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
        +bool in_capital
    }

    class CensoMetricas {
        +int qt_vg_total
        +int qt_vg_total_diurno
        +int qt_vg_total_noturno
        +int qt_vg_total_ead
        +int qt_ing
        +int qt_ing_prounii
        +int qt_ing_prounip
        +int qt_ing_fies
        +int qt_ing_rpfies
        +int qt_ing_nrpfies
        +int qt_ing_reserva_vaga
        +int qt_mat
        +int qt_apoio_social
        +int qt_mat_apoio_social
        +int qt_ativ_extracurricular
        +int qt_mat_ativ_extracurricular
    }

    class Enade {
        +int ano_enade
        +float format_conceito_continuo_enade
        +string conceito_faixa_enade
    }

    class Tda {
        +int nu_ano_ingresso_tda
        +int nu_ano_referencia_tda
        +float tap
        +float tca
        +float tda
    }

    class Sisu {
        +bool tem_sisu
        +[]Oferta ofertas
    }

    class Oferta {
        +string municipio
        +string nome_municipio
        +string turno
        +string modalidade
        +int ordem_modalidade
        +string grupo
        +string descricao
        +int vagas
        +float nota_corte
        +int inscricoes
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

## 4. Parâmetros de Entrada e Tratamento de Erros

### Query Parameters Aceitos pelo Endpoint `GET /cursos`

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `q` | `string` | **Sim** | — | Termo de busca textual (ex: `"medicina"`, `"direito"`, `"engenharia"`) |
| `page` | `int` | Não | `1` | Número da página para paginação |
| `limit` | `int` | Não | `20` | Quantidade de itens por página (mínimo 1, máximo 100) |
| `uf` | `string` / `[]string` | Não | — | Filtro de estado(s), ex: `uf=SP` ou `uf=SP,RJ` |
| `turno` | `string` / `[]string` | Não | — | Filtro de turno (`diurno`, `noturno`, `integral`, `ead`) |
| `grau` | `string` / `[]string` | Não | — | Filtro de grau acadêmico (`bacharelado`, `licenciatura`, `tecnologico`) |
| `categoria` | `string` / `[]string` | Não | — | Filtro de categoria administrativa (`privada`, `federal`, `estadual`, `municipal`) |
| `modalidade` | `string` / `[]string` | Não | — | Filtro de modalidade de ensino (`presencial`, `ead`) |
| `enade` | `string` / `[]string` | Não | — | Filtro de conceito ENADE faixa (`1`, `2`, `3`, `4`, `5`) |
| `sort` | `string` | Não | `_score` | Critério de ordenação (`enade`, `desistencia`, `az`) |

### Respostas e Códigos HTTP

- **`200 OK`**: Retorna objeto `CursoListResponse` em JSON.
- **`400 Bad Request`**: Parâmetro `q` ausente ou inválido.
- **`405 Method Not Allowed`**: Método HTTP diferente de `GET`.
- **`500 Internal Server Error`**: Falhas de comunicação com o Elasticsearch ou erro interno no processamento.
