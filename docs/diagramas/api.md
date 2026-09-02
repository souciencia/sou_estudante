# Diagrama da API — Módulo de Cursos

Visão do fluxo de informação do endpoint `GET /cursos`, no pacote `packages/api/internal/features/cursos/`.

## Visão geral

```mermaid
flowchart TD
    Client[Cliente / Frontend] -->|"GET /cursos?q=termo&page=1&limit=20"| Handler

    subgraph Handler["handler.go — Handler.ServeHTTP"]
        H1["1. Valida método HTTP (deve ser GET)"]
        H2["2. Lê query params: q, page, limit<br/>q obrigatório • page default 1 • limit default 20 (1–100)"]
        H3["3. Cria contexto com timeout de 5s"]
        H4["4. Chama Service.BuscarCursos(ctx, q, page, limit)"]
        H5["5. Serializa CursoListResponse e retorna JSON 200"]
    end

    Handler --> H1 --> H2 --> H3 --> H4 --> H5

    H4 -->|"BuscarCursos"| Service

    subgraph Service["service.go — ServiceImpl.BuscarCursos"]
        S1["1. Valida parâmetros (mesmas regras do handler)"]
        S2["2. Repository.Search(ctx, q, page, limit)"]
        S3["3. transformHitToCurso: cada hit ES → struct Curso<br/>(via marshal/unmarshal JSON)"]
        S4["4. buildPaginationLinks: gera links HATEOAS<br/>(self, first, prev, next, last)"]
        S5["5. Monta CursoListResponse"]
    end

    Service --> S1 --> S2 --> S3 --> S4 --> S5

    S2 -->|"Search"| Repository

    subgraph Repository["repository.go — ElasticsearchRepository.Search"]
        R1["1. Calcula offset: from = (page-1) * limit"]
        R2["2. Monta query DSL multi_match com pesos:<br/>curso.no_curso^3, curso.cine.no_cine_rotulo^2,<br/>localizacao.no_municipio, localizacao.sg_uf, localizacao.no_regiao<br/>fuzziness AUTO • sort por _score"]
        R3["3. Serializa query para JSON"]
        R4["4. Executa busca no índice 'cursos' (track_total_hits)"]
        R5["5. Verifica erro HTTP da resposta"]
        R6["6. Faz parse da resposta (total + hits)"]
        R7["7. Adiciona _id ao _source de cada hit<br/>e monta SearchResult"]
    end

    Repository --> R1 --> R2 --> R3 --> R4 --> R5 --> R6 --> R7
    R4 -->|"multi_match + paginação"| ES[(Elasticsearch<br/>índice 'cursos')]
    ES -->|"hits + total"| R4

    S5 -->|"CursoListResponse (JSON)"| H5
    H5 -->|"200 OK application/json"| Client
```

## Camadas e responsabilidades

```mermaid
graph LR
    subgraph Interface["Interfaces (contratos)"]
        SVC["Service (service.go:11)<br/>BuscarCursos"]
        REPO["Repository (repository.go:13)<br/>Search"]
    end

    subgraph Implementacao["Implementações"]
        SVCImpl["ServiceImpl<br/>(service.go:16)"]
        ESRepo["ElasticsearchRepository<br/>(repository.go:18)"]
    end

    Handler2["Handler<br/>(handler.go:13)"]
    SVCImpl -->|usa| REPO
    ESRepo -->|implementa| REPO
    SVCImpl -->|implementa| SVC
    Handler2 -->|usa| SVC
```

## Modelos de dados (models.go)

```mermaid
classDiagram
    class CursoListResponse {
        +int total
        +int page
        +int limit
        +[]Curso results
        +PaginationLinks links
    }
    class PaginationLinks {
        +string self
        +string first
        +string prev
        +string next
        +string last
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
        +float conceito_continuo_enade
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

    CursoListResponse --> PaginationLinks
    CursoListResponse --> Curso
    Curso --> Instituicao
    Curso --> DadosCurso
    Curso --> Localizacao
    Curso --> CensoMetricas
    Curso --> Enade
    Curso --> Tda
    Curso --> Sisu
    Sisu --> Oferta
    DadosCurso --> Cine
```

## Fluxo da informação (resumo textual)

1. **Handler** (`handler.go`) recebe `GET /cursos?q=&page=&limit=`, valida o método e os parâmetros (`q` obrigatório; `page` mínimo 1; `limit` entre 1 e 100), aplica timeout de 5s no contexto e delega para o service.
2. **Service** (`service.go`) revalida os parâmetros, chama o repositório, converte cada documento do Elasticsearch em `Curso` (via marshal/unmarshal JSON — hits inválidos são ignorados, apenas logados), gera os links HATEOAS de paginação e monta o `CursoListResponse`.
3. **Repository** (`repository.go`) calcula o offset `(page-1)*limit`, monta a query DSL `multi_match` (busca em `curso.no_curso^3`, `curso.cine.no_cine_rotulo^2`, `localizacao.no_municipio`, `localizacao.sg_uf` e `localizacao.no_regiao`, com `fuzziness: AUTO`), executa a busca no índice `cursos`, trata erros HTTP do Elasticsearch, faz o parse da resposta e anexa `_id` ao `_source` de cada hit.
4. **Response** é serializada pelo handler como JSON (`200 OK`). Erros: `400` para `q` ausente, `405` para método inválido, `500` para falhas internas.
