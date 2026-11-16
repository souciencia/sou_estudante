# AGENTS.md — SoU_Estudante Project

## Project's topology

| folder            | container   | port | tech          |                 |
| ----------------- | ----------- | ---- | ------------- | --------------- |
| .                 | `dev`       |      |               | you are here!   |
| `api`    | `se_api`    | 8080 | `Go`          | HTTP somente leitura    |
| `api`    | `se_bulk` |      | Go            | job one-shot de ingestão (`cmd/seed`) via `--profile bulk` |
| `front/` | `se_front`  | 3000 | Next.js       |                 |
|                   | `se_es01`   | 9200 | Elasticsearch | Configured in `docker-compose.yml`    |

Network: `data_net`.


## Rules
- ⚠️: DON'T READ `_data/dados_cursos.json`.
- ⚠️: Never try to install inside this container (dev container).
- When making tests, verify if containers are up.
- Execute commands and tests using: `podman exec -it ...`
  - Exception: if `podman exec` fails (e.g. `newuidmap` error), run only lint, typecheck and unit tests with the local binaries (`front/node_modules/.bin/*`, Go via Mise), without installing anything, and tell me that the fallback was used. Anything that needs the containers (Elasticsearch, seed, build) is not covered: report it and wait.

