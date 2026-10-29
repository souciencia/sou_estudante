#!/usr/bin/env bash
# =============================================================================
# setup.sh — orquestrador único do SoU_Estudante.
#
# Pergunta se o setup é para desenvolvimento ou produção e delega para a
# rotina correspondente em scripts/routines/. As funções e rotinas ficam em
# arquivos pequenos dentro de scripts/lib/ e scripts/routines/.
#
# Uso:
#   ./setup.sh                  # pergunta o ambiente (dev/prod)
#   ./setup.sh --dev            # ambiente de desenvolvimento (local)
#   ./setup.sh --prod           # ambiente de produção (no servidor)
# =============================================================================

set -euo pipefail
umask 077

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$ROOT/scripts"

# -----------------------------------------------------------------------------
# Carrega as bibliotecas compartilhadas (funções), em ordem de dependência.
# -----------------------------------------------------------------------------
source "$SCRIPTS_DIR/lib/log.sh"
source "$SCRIPTS_DIR/lib/util.sh"
source "$SCRIPTS_DIR/lib/env.sh"
source "$SCRIPTS_DIR/lib/engine.sh"
source "$SCRIPTS_DIR/lib/curl.sh"
source "$SCRIPTS_DIR/lib/es.sh"
source "$SCRIPTS_DIR/routines/dev.sh"
source "$SCRIPTS_DIR/routines/prod.sh"

# -----------------------------------------------------------------------------
# Configuração padrão
# -----------------------------------------------------------------------------
ENV_FILE="./.env"
ENV_EXAMPLE_FILE="./.env.example"
API_KEY_NAME="app-api-key"
BULK_API_KEY_NAME="bulk-api-key"
API_KEY_EXPIRATION=""          # Ex: 30d (vazio = sem expiração)
API_INDEX_PATTERN="*"
BULK_INDEX_PATTERN="*"

# URL usada pelo PRÓPRIO script (host). O .env continua com a URL interna.
ES_HOST_URL="${ES_HOST_URL:-http://localhost:9200}"
FRONT_URL="http://localhost:3000"
ES_SERVICE="se_es01"           # nome do serviço no docker-compose
ES_CONTAINER=""                # vazio = resolve via ESNODE01_NAME do .env
BULK_SERVICE="se_bulk"
BULK_PROFILE="bulk"

CURL_TIMEOUT=10
CURL_INSECURE=false
WAIT_SECONDS=180               # 0 = aguarda sem limite até o ES ficar pronto

# Comportamentos
KEEP_ENV=false
BACKUP_ENV=true
NON_INTERACTIVE=false
DRY_RUN=false
REUSE_VALID_KEYS=false         # reutiliza chaves válidas em vez de recriar
PURGE_ALL_KEYS=false           # revoga TODAS as API Keys (perigoso)
SKIP_ES_UP=false
SKIP_BULK=false
SKIP_BUILD=false
API_ROLE_DESCRIPTORS_FILE=""
BULK_ROLE_DESCRIPTORS_FILE=""

CLI_USER=""
CLI_PASS=""

# Engine de containers: vazio = autodetectar; "podman" ou "docker" força.
ENGINE=""
CONTAINER_ENGINE=""
COMPOSE_CMD=()

# Produção (routines/prod.sh)
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
export IMAGE_TAG="${IMAGE_TAG:-latest}"

# Ambiente alvo: "dev" ou "prod" (vazio = pergunta)
TARGET=""

# -----------------------------------------------------------------------------
# CLI / Argumentos
# -----------------------------------------------------------------------------
usage() {
  printf '%b\n' "${BOLD}Uso:${RESET} $(basename "$0") ${MUTED}[opções]${RESET}

${BOLD}${CATEGORY_COLOR}Ambiente:${RESET}
  ${CMD}--dev${RESET}                            Setup de desenvolvimento (local)
  ${CMD}--prod${RESET}                           Deploy de produção (no servidor)
  ${MUTED}(sem --dev/--prod, pergunta o ambiente)${RESET}

${BOLD}${CATEGORY_COLOR}Arquivos e credenciais:${RESET}
  ${CMD}-e, --env-file <caminho>${RESET}        Arquivo .env de destino ${MUTED}(padrão: ${ENV_FILE})${RESET}
  ${CMD}-x, --example-file <caminho>${RESET}    Arquivo modelo ${MUTED}(padrão: ${ENV_EXAMPLE_FILE})${RESET}
  ${CMD}    --keep-env${RESET}                  Não recria o .env a partir do exemplo
  ${CMD}    --no-backup${RESET}                 Não faz backup do .env anterior
  ${CMD}-u, --username <usuario>${RESET}        Usuário ES (sobrescreve o .env)
  ${CMD}-P, --password <senha>${RESET}          Senha ES (sobrescreve o .env)

${BOLD}${CATEGORY_COLOR}Elasticsearch / containers (dev):${RESET}
  ${CMD}    --url <url>${RESET}                 URL do ES vista do host ${MUTED}(padrão: ${ES_HOST_URL})${RESET}
  ${CMD}    --es-service <nome>${RESET}         Serviço do ES no compose ${MUTED}(padrão: ${ES_SERVICE})${RESET}
  ${CMD}    --es-container <nome>${RESET}       Nome do container do ES ${MUTED}(padrão: ESNODE01_NAME)${RESET}
  ${CMD}-w, --wait <segundos>${RESET}           Espera o ES ficar pronto; 0 = sem limite ${MUTED}(padrão: ${WAIT_SECONDS})${RESET}
  ${CMD}    --skip-es-up${RESET}                Não tenta subir o ES (apenas aguarda)
  ${CMD}    --skip-bulk${RESET}              Não executa o container de bulking
  ${CMD}    --skip-build${RESET}             Não constrói as imagens (API, bulk e front)
  ${CMD}    --bulk-service <nome>${RESET}     Serviço do bulk ${MUTED}(padrão: ${BULK_SERVICE})${RESET}
  ${CMD}    --bulk-profile <nome>${RESET}     Profile do bulk ${MUTED}(padrão: ${BULK_PROFILE})${RESET}

${BOLD}${CATEGORY_COLOR}API Keys (Privilégio Mínimo):${RESET}
  ${CMD}-n, --key-name <nome>${RESET}           Nome da API key somente leitura ${MUTED}(padrão: ${API_KEY_NAME})${RESET}
  ${CMD}    --bulk-key-name <nome>${RESET}    Nome da API key do bulk ${MUTED}(padrão: ${BULK_API_KEY_NAME})${RESET}
  ${CMD}-t, --expiration <tempo>${RESET}        Expiração das chaves, ex.: 30d ${MUTED}(padrão: sem expiração)${RESET}
  ${CMD}    --reuse-valid-keys${RESET}          Reutiliza chaves válidas (não recria)
  ${CMD}    --purge-all-keys${RESET}            Revoga TODAS as API Keys antes de gerar ${MUTED}(perigoso)${RESET}
  ${CMD}    --api-role-descriptors <json>${RESET} Caminho para JSON de role descriptors da API (leitura)
  ${CMD}    --bulk-role-descriptors <json>${RESET} Caminho para JSON de role descriptors do bulk
  ${CMD}    --api-pattern <pattern>${RESET}     Índices da chave de leitura ${MUTED}(padrão: ${API_INDEX_PATTERN})${RESET}
  ${CMD}-p, --index-pattern <pattern>${RESET}   Índices da chave do bulk ${MUTED}(padrão: ${BULK_INDEX_PATTERN})${RESET}

${BOLD}${CATEGORY_COLOR}Gerais:${RESET}
  ${CMD}    --non-interactive${RESET}           Modo CI: não faz perguntas no terminal
  ${CMD}    --dry-run${RESET}                   Simula as ações sem alterar o .env ou criar recursos
  ${CMD}    --timeout <segundos>${RESET}        Timeout do curl ${MUTED}(padrão: ${CURL_TIMEOUT})${RESET}
  ${CMD}    --engine <podman|docker>${RESET}    Engine de containers ${MUTED}(padrão: autodetectar)${RESET}
  ${CMD}-k, --insecure${RESET}                  Ignora validação do certificado TLS
  ${CMD}-h, --help${RESET}                      Exibe esta ajuda

${MUTED}Notas: --force e --invalidate-old são aceitos por compatibilidade, mas
recriar as chaves já é o comportamento padrão.${RESET}"
}

require_option_value() {
  [[ -n "${2:-}" ]] || die "A opção $1 requer um valor."
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dev)                    TARGET=dev; shift ;;
      --prod)                   TARGET=prod; shift ;;
      -e|--env-file)          require_option_value "$1" "${2:-}"; ENV_FILE="$2"; shift 2 ;;
      -x|--example-file)      require_option_value "$1" "${2:-}"; ENV_EXAMPLE_FILE="$2"; shift 2 ;;
      --keep-env)             KEEP_ENV=true; shift ;;
      --no-backup)            BACKUP_ENV=false; shift ;;
      -u|--username)          require_option_value "$1" "${2:-}"; CLI_USER="$2"; shift 2 ;;
      -P|--password)          require_option_value "$1" "${2:-}"; CLI_PASS="$2"; shift 2 ;;
      --url)                  require_option_value "$1" "${2:-}"; ES_HOST_URL="$2"; shift 2 ;;
      --es-service)           require_option_value "$1" "${2:-}"; ES_SERVICE="$2"; shift 2 ;;
      --es-container)         require_option_value "$1" "${2:-}"; ES_CONTAINER="$2"; shift 2 ;;
      -w|--wait)              require_option_value "$1" "${2:-}"; WAIT_SECONDS="$2"; shift 2 ;;
      --skip-es-up)           SKIP_ES_UP=true; shift ;;
      --skip-bulk)          SKIP_BULK=true; shift ;;
      --skip-build)         SKIP_BUILD=true; shift ;;
      --bulk-service)       require_option_value "$1" "${2:-}"; BULK_SERVICE="$2"; shift 2 ;;
      --bulk-profile)       require_option_value "$1" "${2:-}"; BULK_PROFILE="$2"; shift 2 ;;
      -n|--key-name)          require_option_value "$1" "${2:-}"; API_KEY_NAME="$2"; shift 2 ;;
      --bulk-key-name)      require_option_value "$1" "${2:-}"; BULK_API_KEY_NAME="$2"; shift 2 ;;
      -t|--expiration)        require_option_value "$1" "${2:-}"; API_KEY_EXPIRATION="$2"; shift 2 ;;
      --reuse-valid-keys)     REUSE_VALID_KEYS=true; shift ;;
      --purge-all-keys)       PURGE_ALL_KEYS=true; shift ;;
      --api-role-descriptors) require_option_value "$1" "${2:-}"; API_ROLE_DESCRIPTORS_FILE="$2"; shift 2 ;;
      --bulk-role-descriptors) require_option_value "$1" "${2:-}"; BULK_ROLE_DESCRIPTORS_FILE="$2"; shift 2 ;;
      --api-pattern)          require_option_value "$1" "${2:-}"; API_INDEX_PATTERN="$2"; shift 2 ;;
      -p|--index-pattern)     require_option_value "$1" "${2:-}"; BULK_INDEX_PATTERN="$2"; shift 2 ;;
      --non-interactive)      NON_INTERACTIVE=true; shift ;;
      --dry-run)              DRY_RUN=true; shift ;;
      --timeout)              require_option_value "$1" "${2:-}"; CURL_TIMEOUT="$2"; shift 2 ;;
      --engine)               require_option_value "$1" "${2:-}"; ENGINE="$2"; shift 2 ;;
      -k|--insecure)          CURL_INSECURE=true; shift ;;
      -f|--force|--invalidate-old) shift ;;
      -h|--help)              usage; exit 0 ;;
      *)                      usage; die "Opção desconhecida: $1" ;;
    esac
  done

  case "$ENGINE" in
    ""|podman|docker) ;;
    *) die "Engine inválido para --engine: '$ENGINE' (use podman ou docker)." ;;
  esac
}

resolve_target() {
  [[ -n "$TARGET" ]] && return 0

  if [[ "$NON_INTERACTIVE" == true ]]; then
    die "Modo não interativo exige --dev ou --prod."
  fi

  local input=""
  while [[ "$input" != "dev" && "$input" != "prod" ]]; do
    read -r -p "$(printf '%b' "  ${CATEGORY_COLOR}?${RESET} Ambiente (dev/prod) [dev]: ")" input || die "Entrada interrompida."
    input="${input:-dev}"
  done
  TARGET="$input"
}

main() {
  parse_args "$@"
  require_command curl
  build_curl_opts

  resolve_target

  cd "$ROOT"

  print_header "Setup do ambiente SoU_Estudante ($([[ "$TARGET" == "prod" ]] && echo produção || echo desenvolvimento))"

  if [[ "$DRY_RUN" == true ]]; then
    log_warn "Modo --dry-run ativo. Nenhuma alteração real será feita."
  fi

  if [[ "$TARGET" == "prod" ]]; then
    run_prod
    return 0
  fi

  # --- desenvolvimento ---
  print_step "1. Arquivo .env"
  reset_env_file

  print_step "2. Credenciais do Elasticsearch"
  ensure_credentials

  run_dev
}

main "$@"
