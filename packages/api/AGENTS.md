
# Go (`api/`)

Para o container de desenvolvimento (Dev) onde roda o agente: Go disponível via Mise (`/home/dev/.local/share/mise/installs/go/1.27.1/bin`)
```
/
- cmd/api/main.go        # HTTP somente leitura
- cmd/seed/main.go       # job one-shot de ingestão (ex-pacote bulk)
- internal
    - apperr            # erros de aplicação (ex.: ErrInvalidInput)
    - config
    - domain            # vocabulário de domínio compartilhado
    - elasticsearch     # cliente + helpers de leitura do Elasticsearch
    - httpx             # respostas JSON, paginação e parsing de query
    - middlewares       # CORS, recover, request-id, access log
    - ingest            # lado de escrita (não importado pela API)
        - bulk          # motor de bulk + operações de índice
        - dictionary    # construção dos índices de dicionário
        - mappings      # mappings dos índices (embeds centralizados)
        - seed          # orquestração idempotente da ingestão
    - features
        - cursos        # model + repository/service/handler (leitura) + ingest/
        - ies           # idem
        - sugestoes
```

- A API (`cmd/api`) é **somente leitura**: não importa `internal/ingest/*`
  nem `features/*/ingest`, e usa a API key somente leitura (`ES_APIKEY`). A
  escrita fica em `cmd/seed`, que usa `ES_INGEST_APIKEY` (leitura/escrita).
- Manter a separação `handlers → services → repository`
- Sempre me pergunte antes de fazer alterações
- Sempre formate os arquivos Go com `gofmt -s -w` antes de commitar
- Mantenha as dependências sincronizadas com `go mod tidy` (garantindo que `go.mod` e `go.sum` estejam sempre atualizados)
