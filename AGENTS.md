# AGENTS.md — SoU_Estudante Project

## Project's topology

| folder            | container   | port | tech          |                 |
| ----------------- | ----------- | ---- | ------------- | --------------- |
| .                 | `dev`       |      |               | you are here!   |
| `packages/api`    | `se_api`    | 8080 | `Go`          |                 |
| `packages/bulker` | `se_bulker` |      |               | using `--profiles` flag in compose    |
| `packages/front/` | `se_front`  | 3000 | Next.js       |                 |
|                   | `se_es01`   | 9200 | Elasticsearch | Configured in `docker-compose.yml`    |

Network: `data_net`.


## Rules
- ⚠️: DON'T READ `packages/bulker/data/dados_curso_completo.json`.
- ⚠️: Never try to install inside this container (dev container).
- When making tests, verify if containers are up.
- Execute commands and tests using: `podman exec -it ...`
- Whenever I ask to read a **task** (or **tarefa**) file, look in the folder `docs/tasks/` for `.md` file for a equivalent. Only read a task file correspondent.


## You have
- podman
- podman-remote
- git-delta
