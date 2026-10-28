# sou_estudante

O **SoU_Estudante** é uma plataforma de pesquisa e comparação de cursos e universidades, feita para ajudar estudantes e pesquisadores.

> Documentação técnica na pasta [docs/](docs/): [diretrizes](docs/00.guidelines.md), [arquitetura](docs/00.arquitetura.md), [banco de dados](docs/10.database.md), [API](docs/20.api.md), [front-end](docs/30.frontend.md), [operação/deploy](docs/40.operacao.md), [glossário](docs/glossario.md) e [decisões (ADR)](docs/adr/README.md). Cada pacote tem seu README: [api](packages/api/README.md) e [front](packages/front/README.md).

## Arquitetura

```
navegador → front (Next.js, :3000) → /api (rewrite) → API (Go, :8080) → Elasticsearch (:9200)
                                                      seed (Go, job) ──┘  (ingestão, escrita)
```

| Serviço | Container | Porta | Tecnologia |
| :--- | :--- | :--- | :--- |
| Banco de dados | `se_es01` | 9200 | Elasticsearch |
| API (somente leitura) | `se_api` | 8080 | Go |
| Ingestão de dados (job) | `se_bulk` | — | Go (`cmd/seed`), só com `--profile bulk` |
| Interface | `se_front` | 3000 | TypeScript + Next.js |

Tudo é orquestrado por `docker-compose.yml` (desenvolvimento) e `docker-compose.prod.yml` (produção).

## Como rodar o projeto

### Pré-requisitos

- **Podman** com `podman compose` (runtime adotado pelo projeto, usado também no deploy). O `setup.sh` usa `podman compose` e, se não encontrar, tenta `podman-compose`, `docker compose` ou `docker-compose`. Para forçar Docker, use `./setup.sh --engine docker`. Os comandos abaixo funcionam com `docker compose` trocando o prefixo.
- `curl`; `jq` é opcional.
- No Windows, use o WSL ([instalação](https://learn.microsoft.com/pt-br/windows/wsl/install)).

### Dados

Os arquivos de dados **não estão no repositório** (a pasta `data/` é ignorada pelo Git). Peça-os à equipe de dados e coloque em `data/`:

- `data/dados_cursos.json`
- `data/dados_ies.json`

Sem eles o `setup.sh` apenas avisa e pula a ingestão: a API sobe, mas sem dados.

### Passo a passo

1. `./setup.sh`

O `./setup.sh` é o orquestrador único: pergunta se o setup é para **desenvolvimento** ou **produção** (ou aceita `--dev`/`--prod`) e delega para a rotina em `scripts/routines/`. No modo desenvolvimento, faz, em ordem: cria o `.env` a partir de `.env.example` (pede a senha do Elasticsearch se estiver em branco); constrói as imagens; sobe o Elasticsearch e aguarda; gera as API keys (leitura para a API, leitura/escrita para a ingestão) e grava no `.env`; roda o job de ingestão `se_bulk`; lista os índices existentes; sobe `se_api` e `se_front`; e abre o front no navegador. No modo produção, gera as API keys **dentro do container do ES** (`podman exec`) e publica os serviços. Veja `./setup.sh --help` para as opções (`--keep-env`, `--skip-build`, `--skip-bulk`, `--dry-run`, `--non-interactive`, ...).

Para reingerir os dados depois: `podman compose --profile bulk run --rm --no-deps se_bulk`. A ingestão sempre reingere por troca atômica (blue/green) (ver [docs/10.database.md](docs/10.database.md)).

## As coisas estão funcionando?

O fluxo passa por três containers; verifique cada um separadamente, pelos logs (`podman logs -f [nome/id]`) e pelas respostas nas portas.

**Elasticsearch** (exige autenticação; um `401` já indica que está no ar)
- http://localhost:9200/

**API**
- http://localhost:8080/healthz (só liveness, não consulta o Elasticsearch)
- http://localhost:8080/cursos?q=medicina (API comunicando com o Elasticsearch)

**Frontend**
- http://localhost:3000/
- http://localhost:3000/cursos e http://localhost:3000/ies (busca e perfil de curso/IES)
- `/ingresso`, `/permanencia` e `/comparar` ainda são páginas vazias (em construção)

## Testes e qualidade

| Pacote | Comando (em `packages/<pacote>`) |
| :--- | :--- |
| API | `go vet ./...`, `go test ./...`, `gofmt -s -l .` (os testes usam `httptest`; não precisam do Elasticsearch) |
| Front | `npm run typecheck`, `npm run test:run`, `npm run check:ci` (Biome), `npm run lint:fix` para corrigir |

Na raiz, `make help` lista atalhos (`make test`, `make lint`, `make up`, `make seed`; usa `podman compose`, ou `make COMPOSE='docker compose' ...`).

Os mesmos checks rodam no CI (`.github/workflows`) e bloqueiam o deploy.

## Como Contribuir

Antes de começar, leia [docs/00.guidelines.md](docs/00.guidelines.md): simplicidade primeiro, TDD (Red → Green → Refactor → Commit) e as regras de cada pacote.

### Organização do código

- **API (Go):** `handlers → services → repository`, por feature em `internal/features/*`. A API é somente leitura e não importa a ingestão (há um teste que garante isso). Ver [packages/api/AGENTS.md](packages/api/AGENTS.md) e [docs/20.api.md](docs/20.api.md).
- **Front (Next.js):** componentes por domínio em `src/components/` (`ui`, `layout`, `search`, `profile`, `enade`). Componentes ricos usam *Compound Components*; os que servem a mais de um domínio são agnósticos e ganham especializações em `wrappers/`. Ver [docs/30.frontend.md](docs/30.frontend.md) e [docs/01.component-composition.md](docs/01.component-composition.md).
- **DRY:** cada regra de negócio ou lógica tem uma só representação. Se um comportamento se repete, extraia para função, *hook* ou componente reutilizável (mas só a partir do segundo uso real).

### Agentes de IA

A pasta `.opencode/skills` traz a skill `accessibility` (WCAG 2.1 AA), que deve ser usada ao escrever ou editar o UI. As regras para agentes estão nos `AGENTS.md`.

### Fluxo de Trabalho para Pull Requests

- Trabalhe em uma branch própria e abra o pull request para a `dev` (a `main` recebe a `dev` e dispara o deploy). Ainda não há convenção de prefixo de branch.
- Rode lint, typecheck e testes do pacote que alterou (tabela acima). Formatação: Biome (front) e `gofmt` (API).
- Commite de forma descritiva: "Adiciona...", "Resolve...", "Refatora...", "Atualiza...".

## Licença livre

Este programa é um software livre; você pode redistribuí-lo e/ou modificá-lo sob os termos da Licença Pública Geral GNU como publicada pela Free Software Foundation; na versão 3 da Licença, ou (a seu critério) qualquer versão posterior.

Este programa é distribuído na esperança de que possa ser útil, mas SEM NENHUMA GARANTIA; sem uma garantia implícita de ADEQUAÇÃO a qualquer MERCADO ou APLICAÇÃO EM PARTICULAR. Veja a Licença Pública Geral GNU para mais detalhes.

Você deve ter recebido uma cópia da Licença Pública Geral GNU junto com este programa. Se não, veja https://www.gnu.org/licenses/.
