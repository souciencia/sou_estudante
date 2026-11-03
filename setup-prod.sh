#!/usr/bin/env bash
# =============================================================================
# setup-prod.sh — deploy de produção (no servidor).
#
# Usa APENAS Docker (a VM não usa podman). Sobe o Elasticsearch, gera as API
# keys DENTRO do container, constrói as imagens, sobe API + front e verifica a
# saúde. Publica via docker-compose.prod.yml.
#
# Uso:
#   ./setup-prod.sh
#   IMAGE_TAG=abc123 ./setup-prod.sh
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
source "$SCRIPTS_DIR/lib/cli.sh"
source "$SCRIPTS_DIR/routines/prod.sh"

# Produção usa apenas Docker.
ENGINE="docker"

SETUP_DESC="Deploy de produção (no servidor). Engine fixo: docker."
ENGINE_DESC="fixo em docker na produção"

# Compose de produção (não o de desenvolvimento).
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
export IMAGE_TAG="${IMAGE_TAG:-latest}"

main() {
  parse_args "$@"

  # Reforça o engine mesmo que --engine tenha sido passado.
  ENGINE="docker"
  require_command curl
  build_curl_opts

  cd "$ROOT"

  print_header "Setup do ambiente SoU_Estudante (produção)"

  if [[ "$DRY_RUN" == true ]]; then
    log_warn "Modo --dry-run ativo. Nenhuma alteração real será feita."
  fi

  run_prod
}

main "$@"
