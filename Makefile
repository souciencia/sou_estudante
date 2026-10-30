# Ponto de entrada único para as tarefas comuns (API em Go + front em Next.js).
# Os alvos de teste e lint rodam no host, com as ferramentas locais; para rodar
# dentro dos containers use `$(COMPOSE) exec <serviço> ...`.
COMPOSE ?= podman compose

.PHONY: help build up down logs seed setup test test-api test-front lint lint-api lint-front fmt

help: ## Lista os alvos
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-12s %s\n", $$1, $$2}'

build: ## Constrói as imagens de desenvolvimento
	$(COMPOSE) build

setup: ## Prepara .env, API keys e ingestão (./setup.sh --dev)
	./setup.sh --dev

up: ## Sobe os serviços em segundo plano
	$(COMPOSE) up -d

down: ## Derruba os serviços
	$(COMPOSE) down

logs: ## Acompanha os logs
	$(COMPOSE) logs -f

seed: ## Roda o job de ingestão (só carrega índices vazios)
	$(COMPOSE) --profile bulk run --rm --no-deps se_bulk

test: test-api test-front ## Testes da API e do front

test-api:
	cd packages/api && go test -race -count=1 ./...

test-front:
	cd packages/front && npm run test:run

lint: lint-api lint-front ## Verificações do CI: formatação, vet e tipos

lint-api:
	cd packages/api && test -z "$$(gofmt -l .)" && go vet ./... && go mod tidy -diff

lint-front:
	cd packages/front && npm run check:ci && npm run typecheck

fmt: ## Formata Go e front
	cd packages/api && gofmt -s -w .
	cd packages/front && npm run lint:fix
