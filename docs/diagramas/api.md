# Diagrama da API — Módulo de Ofertas

Visão do fluxo de informação do endpoint `GET /ofertas`, no pacote `packages/api/internal/features/ofertas/`.

## Visão geral

```mermaid
flowchart TD
    Client[Cliente / Frontend] -->|"GET /ofertas?q=termo&page=1&limit=20"| Handler

    subgraph Handler["handler.go — Handler.ServeHTTP"]
        H1["1. Valida método HTTP (deve ser GET)"]
        H2["2. Lê query params: q, page, limit<br/>q obrigatório • page default 1 • limit default 20 (1–100)"]
        H3["3. Cria contexto com timeout de 5s"]
        H4["4. Chama Service.BuscarOfertas(ctx, q, page, limit)"]
        H5["5. Serializa ListResponse e retorna JSON 200"]
    end

    Handler --> H1 --> H2 --> H3 --> H4 --> H5

    H4 -->|"BuscarOfertas"| Service

    subgraph Service["service.go — ServiceImpl.BuscarOfertas"]
        S1["1. Valida parâmetros (mesmas regras do handler)"]
        S2["2. Repository.Search(ctx, q, page, limit)"]
        S3["3. transformHitToOferta: cada hit ES → struct Oferta<br/>(via marshal/unmarshal JSON)"]
        S4["4. buildPaginationLinks: gera links HATEOAS<br/>(self, first, prev, next, last)"]
        S5["5. Monta ListResponse"]
    end

    Service --> S1 --> S2 --> S3 --> S4 --> S5

    S2 -->|"Search"| Repository

    subgraph Repository["repository.go — ElasticsearchRepository.Search"]
        R1["1. Calcula offset: from = (page-1) * limit"]
        R2["2. Monta query DSL multi_match com pesos:<br/>no_curso^3, cine^2, sg_ies^1.5, no_ies, municipio, UF<br/>fuzziness AUTO • sort por _score"]
        R3["3. Serializa query para JSON"]
        R4["4. Executa busca no índice 'ofertas' (track_total_hits)"]
        R5["5. Verifica erro HTTP da resposta"]
        R6["6. Faz parse da resposta (total + hits)"]
        R7["7. Adiciona _id ao _source de cada hit<br/>e monta SearchResult"]
    end

    Repository --> R1 --> R2 --> R3 --> R4 --> R5 --> R6 --> R7
    R4 -->|"multi_match + paginação"| ES[(Elasticsearch<br/>índice 'ofertas')]
    ES -->|"hits + total"| R4

    S5 -->|"ListResponse (JSON)"| H5
    H5 -->|"200 OK application/json"| Client
```

## Camadas e responsabilidades

```mermaid
graph LR
    subgraph Interface["Interfaces (contratos)"]
        SVC["Service (service.go:11)<br/>BuscarOfertas"]
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
    class ListResponse {
        +int total
        +int page
        +int limit
        +[]Oferta results
        +PaginationLinks links
    }
    class PaginationLinks {
        +string self
        +string first
        +string prev
        +string next
        +string last
    }
    class Oferta {
        +int64 sequencial
        +int nu_ano_censo
        +string edicao
        +string dt_carga
        +Instituicao instituicao
        +Curso curso
        +Localizacao localizacao
        +CensoMetricas censo_metricas
        +QualidadeMEC qualidade_mec
        +Sisu sisu
    }
    class Instituicao {
        +string co_ies
        +string no_ies
        +string sg_ies
        +bool in_comunitaria_ies
        +bool in_confessional_ies
        +Endereco endereco
        +CorpoDocente corpo_docente
    }
    class Curso {
        +string co_curso
        +string no_curso
        +string no_grau_academico
        +bool in_gratuito
        +Cine cine
    }
    class Localizacao {
        +string no_regiao
        +string no_uf
        +string sg_uf
        +string no_municipio
        +bool in_capital
        +string no_campus
    }
    class CensoMetricas {
        +int qt_vg_total
        +int qt_ing
        +int qt_mat
        +int qt_apoio_social
    }
    class QualidadeMEC {
        +float conceito_enade_continuo
        +float cpc_continuo
        +float igc_continuo
        +float tap
    }
    class Sisu {
        +bool tem_sisu
        +string ds_turno
        +int qt_vagas_concorrencia
        +float nu_notacorte
        +int qt_inscricao
    }
    class Cine {
        +string co_cine_rotulo
        +string no_cine_rotulo
        +string co_cine_area_geral
    }
    class Endereco {
        +string ds_endereco_ies
        +string nu_cep_ies
    }
    class CorpoDocente {
        +int qt_doc_total
        +float perc_mestres
        +float perc_doutores
    }

    ListResponse --> PaginationLinks
    ListResponse --> Oferta
    Oferta --> Instituicao
    Oferta --> Curso
    Oferta --> Localizacao
    Oferta --> CensoMetricas
    Oferta --> QualidadeMEC
    Oferta --> Sisu
    Instituicao --> Endereco
    Instituicao --> CorpoDocente
    Curso --> Cine
```

## Fluxo da informação (resumo textual)

1. **Handler** (`handler.go`) recebe `GET /ofertas?q=&page=&limit=`, valida o método e os parâmetros (`q` obrigatório; `page` mínimo 1; `limit` entre 1 e 100), aplica timeout de 5s no contexto e delega para o service.
2. **Service** (`service.go`) revalida os parâmetros, chama o repositório, converte cada documento do Elasticsearch em `Oferta` (via marshal/unmarshal JSON — hits inválidos são ignorados, apenas logados), gera os links HATEOAS de paginação e monta o `ListResponse`.
3. **Repository** (`repository.go`) calcula o offset `(page-1)*limit`, monta a query DSL `multi_match` (busca em `curso.no_curso^3`, `cine.no_cine_rotulo^2`, `instituicao.no_ies`, `sg_ies^1.5`, município e UF, com `fuzziness: AUTO`), executa a busca no índice `ofertas`, trata erros HTTP do Elasticsearch, faz o parse da resposta e anexa `_id` ao `_source` de cada hit.
4. **Response** é serializada pelo handler como JSON (`200 OK`). Erros: `400` para `q` ausente, `405` para método inválido, `500` para falhas internas.
