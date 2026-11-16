
# Go (`api/`)

Para o container de desenvolvimento (Dev) onde roda o agente: Go disponível via Mise (`/home/dev/.local/share/mise/installs/go/1.27.1/bin`)

**Versão do Go:** `go 1.27` em `go.mod` é a fonte única. Os Dockerfiles usam `golang:1.27-alpine` e o CI lê a versão do `go.mod` (`go-version-file`). Ao subir de versão, altere `go.mod` e os três Dockerfiles (`Dockerfile`, `Dockerfile.dev`, `Dockerfile.seed`) no mesmo commit. Política: acompanhar as duas versões suportadas pelo projeto Go; a 1.22 saiu de suporte.
```
/
- cmd/api/main.go        # HTTP somente leitura
- cmd/seed/main.go       # job one-shot de ingestão (ex-pacote bulk)
- internal
    - apperr            # erros de aplicação (ex.: ErrInvalidInput)
    - config
    - domain            # vocabulário de domínio compartilhado
    - elasticsearch     # cliente, helpers de leitura e builders da query DSL (query.go)
    - httpx             # respostas JSON, paginação e parsing de query
    - middlewares       # CORS, recover, request-id, access log
    - testutil          # helpers de teste (cliente ES sobre httptest, JSON e arquivos temporários)
    - textcase          # normalização de caixa de texto (compartilhado pela API e ingestão)
    - ingest            # lado de escrita (não importado pela API)
        - bulk          # motor de bulk + operações de índice
        - dictionary    # construção dos índices de dicionário
        - mappings      # mappings dos índices (embeds centralizados)
        - seed          # orquestração da ingestão (troca atômica por alias -latest)
    - features
        - cursos        # model + repository/service/handler (leitura) + ingest/
        - ies           # idem
        - sugestoes
```

- A API (`cmd/api`) é **somente leitura**: não importa `internal/ingest/*`
  nem `features/*/ingest`, e usa a API key somente leitura (`ES_APIKEY`). A
  escrita fica em `cmd/seed`, que usa `ES_INGEST_APIKEY` (leitura/escrita).
- Manter a separação `handlers → services → repository`
- Arquivos por feature: `handler.go`, `service.go`, `repository.go`, `model.go` (singular, sem sufixo de papel no nome); testes em `<arquivo>_test.go`. Ver `_docs/00.guidelines.md`.
- Testes: `TestXxx` com nome em português que descreve o comportamento (ex.: `TestBuscarCursosRejeitaSortDesconhecido`), sem acentos nos identificadores; um nome por comportamento, não por função. Dublês escritos à mão e `httptest` (`internal/testutil`), sem biblioteca de mock.
- Use `any`, não `interface{}`. Paginação (`page`/`limit`) é lida e normalizada só por `httpx.ParsePagination`/`httpx.NormalizePagination`.
- Sempre me pergunte antes de fazer alterações
- Sempre formate os arquivos Go com `gofmt -s -w` antes de commitar
- Mantenha as dependências sincronizadas com `go mod tidy` (garantindo que `go.mod` e `go.sum` estejam sempre atualizados)
