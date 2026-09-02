#!/usr/bin/env bash
set -euo pipefail

# Executa um comando dentro do container `se_front` com saída legível.
#
# O socket do Podman usa um stream multiplexado (stdout/stderr) que injeta
# bytes de controle (\x01/\x02 + cabeçalho de tamanho) quando lido cru
# (ex.: curl --unix-socket). Os CLIs podman/podman-remote já decodificam esse
# framing, então a saída chega limpa ao terminal.
#
# Uso:
#   scripts/front.sh node --version
#   scripts/front.sh biome check --max-diagnostics=500
#   scripts/front.sh vitest run
#
# Obs.: para comandos interativos/watch (ex.: vitest sem "run"), rode com -t,
# ex.: podman exec -it se_front npm test

CONTAINER_NAME="${SE_FRONT_CONTAINER:-se_front}"

if [ "$#" -eq 0 ]; then
    echo "Uso: $0 <comando> [args...]" >&2
    exit 1
fi

PODMAN_BIN=""
if command -v podman >/dev/null 2>&1; then
    PODMAN_BIN="podman"
elif command -v podman-remote >/dev/null 2>&1; then
    PODMAN_BIN="podman-remote"
fi

if [ -z "$PODMAN_BIN" ]; then
    echo "Erro: podman/podman-remote não encontrado." >&2
    exit 1
fi

# Ao rodar de dentro do container `dev`, $HOME/.config pertence a root e o
# podman recusa usar esse path. Apontamos a config para um local gravável.
if [ ! -O "$HOME/.config" ]; then
    XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.cache/podman-config}"
    export XDG_CONFIG_HOME
    mkdir -p "$XDG_CONFIG_HOME"
fi

exec "$PODMAN_BIN" exec --workdir /app "$CONTAINER_NAME" "$@"
