#!/usr/bin/env bash
# =============================================================================
# setup-dev.sh — setup do ambiente de desenvolvimento (local).
#
# Sobe o Elasticsearch, gera as API keys, roda o job de ingestão (bulk) e
# sobe API + front. O engine de containers é autodetectado (podman > docker)
# e pode ser forçado com --engine.
#
# Uso:
#   ./setup-dev.sh
#   ./setup-dev.sh --engine docker
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
source "$SCRIPTS_DIR/routines/dev.sh"

SETUP_DESC="Setup de desenvolvimento (local)."
ENGINE_DESC="padrão: autodetectar"

main() {
  parse_args "$@"
  require_command curl
  build_curl_opts

  cd "$ROOT"

  print_header "Setup do ambiente SoU_Estudante (desenvolvimento)"

  if [[ "$DRY_RUN" == true ]]; then
    log_warn "Modo --dry-run ativo. Nenhuma alteração real será feita."
  fi

  print_step "1. Arquivo .env"
  reset_env_file

  print_step "2. Credenciais do Elasticsearch"
  ensure_credentials

  run_dev
}

main "$@"
