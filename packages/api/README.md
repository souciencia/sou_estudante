# API (Go)

API HTTP somente leitura sobre o Elasticsearch, mais o job de ingestão
(`cmd/seed`). Container `se_api` (porta 8080) e `se_bulk` (job, `--profile bulk`).

- Estrutura de pastas e regras do pacote: [AGENTS.md](AGENTS.md)
- Endpoints: [docs/20.api.md](../../docs/20.api.md)
- Índices e mappings: [docs/10.database.md](../../docs/10.database.md)
- Visão geral: [docs/00.arquitetura.md](../../docs/00.arquitetura.md)

## Comandos

Execute em `packages/api` (Go 1.27, definido em `go.mod`):

| Tarefa | Comando |
| :--- | :--- |
| Testes | `go test ./...` (usam `httptest`; **não** precisam do Elasticsearch) |
| Análise estática | `go vet ./...` |
| Formatar | `gofmt -s -w .` (o CI roda `gofmt -l .`) |
| Dependências | `go mod tidy` (o CI roda `go mod tidy -diff`) |
| Rodar a API local | `go run ./cmd/api` (precisa de `ES_URL` e `ES_APIKEY`) |
| Recarga automática (dev) | `air`, usado pelo `Dockerfile.dev` |

No ambiente do projeto os comandos rodam dentro do container
(`podman exec -it se_api ...`).

## Variáveis de ambiente

Lidas em `internal/config/config.go`. **A API não sobe sem `ES_APIKEY`** e o seed não roda sem `ES_INGEST_APIKEY` (o `./setup-dev.sh`/`./setup-prod.sh` gera as duas). Valores inteiros inválidos ou ≤ 0 geram um aviso no log e usam o padrão. Principais: `ES_URL`, `ES_APIKEY` (leitura,
API), `ES_INGEST_APIKEY` (escrita, seed), `PORT` (padrão `8080`) e os nomes dos
índices (`CURSOS_INDEX_NAME`, `IES_INDEX_NAME`, `CURSOS_DICT_INDEX_NAME`,
`IES_DICT_INDEX_NAME`). O seed também usa `CURSOS_JSON_FILE_PATH`, `IES_JSON_FILE_PATH`,
`ES_NUM_WORKERS`, `ES_FLUSH_BYTES` e `ES_FLUSH_INTERVAL_SEC`. O modelo está em
`.env.example`, na raiz do repositório.
