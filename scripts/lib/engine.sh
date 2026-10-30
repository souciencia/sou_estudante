# Detecção do engine de containers (podman/docker) e do comando de compose.
# Requer as variáveis globais ENGINE, CONTAINER_ENGINE e COMPOSE_CMD.

require_engine() {
  [[ -n "$CONTAINER_ENGINE" ]] && return 0
  if [[ -n "$ENGINE" ]]; then
    command -v "$ENGINE" >/dev/null 2>&1 || die "Engine solicitado não encontrado: $ENGINE"
    CONTAINER_ENGINE="$ENGINE"
    return 0
  fi
  if command -v podman >/dev/null 2>&1; then
    CONTAINER_ENGINE="podman"
  elif command -v docker >/dev/null 2>&1; then
    CONTAINER_ENGINE="docker"
  else
    die "Nenhum engine de containers encontrado (podman ou docker)."
  fi
}

require_compose() {
  [[ ${#COMPOSE_CMD[@]} -gt 0 ]] && return 0
  if [[ -n "$ENGINE" ]]; then
    case "$ENGINE" in
      podman)
        if podman compose version >/dev/null 2>&1; then
          COMPOSE_CMD=(podman compose)
        elif command -v podman-compose >/dev/null 2>&1; then
          COMPOSE_CMD=(podman-compose)
        else
          die "Engine podman solicitado, mas nenhum compose compatível encontrado (podman compose ou podman-compose)."
        fi
        return 0
        ;;
      docker)
        if docker compose version >/dev/null 2>&1; then
          COMPOSE_CMD=(docker compose)
        elif command -v docker-compose >/dev/null 2>&1; then
          COMPOSE_CMD=(docker-compose)
        else
          die "Engine docker solicitado, mas nenhum compose compatível encontrado (docker compose ou docker-compose)."
        fi
        return 0
        ;;
    esac
  fi
  if command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(podman compose)
  elif command -v podman-compose >/dev/null 2>&1; then
    COMPOSE_CMD=(podman-compose)
  elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD=(docker-compose)
  else
    die "Nenhum compose encontrado (podman compose, podman-compose, docker compose, docker-compose)."
  fi
}

compose_display() {
  if [[ ${#COMPOSE_CMD[@]} -gt 0 ]]; then
    printf '%s' "${COMPOSE_CMD[*]}"
  elif [[ "$ENGINE" == "docker" ]]; then
    printf 'docker compose'
  else
    printf 'podman compose'
  fi
}

container_exists() {
  require_engine
  "$CONTAINER_ENGINE" inspect "$1" >/dev/null 2>&1
}

container_is_running() {
  local state
  require_engine
  state="$("$CONTAINER_ENGINE" inspect --format '{{.State.Running}}' "$1" 2>/dev/null || true)"
  [[ "$state" == "true" ]]
}
