#!/usr/bin/env bash
# =============================================================================
# bootstrap-rootless.sh — prepara uma VM para o deploy rootless do SoU_Estudante.
#
# Prepara o host para rodar o stack (Elasticsearch, API, front e Caddy) como um
# usuário SEM privilégios, usando Podman rootless. Requer root/sudo apenas nesta
# etapa; o deploy diário (`setup.sh --prod`) roda sem sudo.
#
# Uso:
#   sudo ./scripts/bootstrap-rootless.sh <usuario>
#
# O que faz:
#   1. Instala podman + compose (apt/dnf).
#   2. Configura subuid/subgid do usuário (namespaces rootless).
#   3. Aplica sysctls exigidos pelo stack:
#        - vm.max_map_count (Elasticsearch);
#        - net.ipv4.ip_unprivileged_port_start=0 (Caddy bindando 80/443).
#   4. Habilita linger (containers sobrevivem a reboot).
#   5. Valida o Podman rootless do usuário.
#
# Idempotente: pode ser executado novamente sem efeitos colaterais.
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Log mínimo (autocontido: não depende de scripts/lib/).
# -----------------------------------------------------------------------------
step() { printf '\n\033[1m\033[38;5;208m▶ %s\033[0m\n' "$*"; }
info() { printf '  \033[38;5;242m•\033[0m %s\n' "$*"; }
ok()   { printf '  \033[38;5;82m✔\033[0m %s\n' "$*"; }
warn() { printf '  \033[38;5;220m!\033[0m %s\n' "$*"; }
die()  { printf '  \033[38;5;196m✘\033[0m %s\n' "$*" >&2; exit "${2:-1}"; }

require_root() {
  [[ "$(id -u)" -eq 0 ]] || die "Execute como root: sudo $0 <usuario>"
}

usage() {
  cat <<EOF
Uso: sudo $0 <usuario>

Prepara o host para o deploy rootless do SoU_Estudante usando o <usuario>
informado (usuário de deploy, sem privilégios).

Ex.: sudo $0 ireno.ricardo
EOF
}

package_install() {
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y "$@"
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y "$@"
  else
    die "Gerenciador de pacotes não suportado (use apt/dnf). Instale manualmente: $*"
  fi
}

main() {
  local username="${1:-}"
  [[ -n "$username" ]] || { usage; die "Informe o usuário de deploy."; }
  require_root

  step "1. Usuário de deploy"
  if ! id "$username" >/dev/null 2>&1; then
    die "Usuário '$username' não existe. Crie antes: useradd -m -s /bin/bash $username"
  fi
  ok "Usuário $username existe."

  step "2. Podman e compose"
  if command -v podman >/dev/null 2>&1; then
    ok "podman já instalado ($(podman --version))."
  else
    info "Instalando podman..."
    package_install podman
    ok "podman instalado ($(podman --version))."
  fi

  if command -v podman-compose >/dev/null 2>&1; then
    ok "podman-compose disponível."
  else
    info "Instalando podman-compose..."
    package_install podman-compose || die "Não foi possível instalar o podman-compose."
    ok "podman-compose instalado."
  fi

  local podman_version
  podman_version="$(podman --version | grep -oE '[0-9]+\.[0-9]+' | head -n1 || true)"
  if [[ -n "$podman_version" ]] && [[ "$(printf '%s\n' "$podman_version" "4.4" | sort -V | head -n1)" != "4.4" ]]; then
    warn "podman ${podman_version} detectado. Para o Caddy bindar 80/443 sem root é preciso podman >= 4.4 (backend pasta). Atualize o podman se o bind falhar."
  fi

  step "3. subuid/subgid (rootless)"
  if grep -q "^${username}:" /etc/subuid 2>/dev/null && grep -q "^${username}:" /etc/subgid 2>/dev/null; then
    ok "subuid/subgid já configurados para $username."
  else
    usermod --add-subuids 100000-165535 --add-subgids 100000-165535 "$username"
    ok "subuid/subgid configurados (100000-165535)."
  fi

  step "4. Sysctls (ES + portas baixas rootless)"
  local sysctl_file="/etc/sysctl.d/99-sou-estudante.conf"
  cat > "$sysctl_file" <<'EOF'
# SoU_Estudante: Elasticsearch (mapas de memória) e bind rootless de 80/443 (Caddy).
vm.max_map_count = 262144
net.ipv4.ip_unprivileged_port_start = 0
EOF
  sysctl -p "$sysctl_file" >/dev/null
  ok "sysctls aplicados (${sysctl_file})."

  step "5. Linger (containers sobrevivem a reboot)"
  if command -v loginctl >/dev/null 2>&1; then
    loginctl enable-linger "$username"
    ok "linger habilitado para $username."
  else
    warn "loginctl não encontrado; sem linger, os containers não reiniciam após reboot."
  fi

  step "6. Validando Podman rootless"
  local rootless
  rootless="$(runuser -u "$username" -- podman info --format '{{.Host.Security.Rootless}}' 2>/dev/null || true)"
  if [[ "$rootless" == "true" ]]; then
    ok "Podman rootless OK para $username."
  else
    warn "Não foi possível confirmar o modo rootless. Confira com: runuser -u $username -- podman info"
  fi

  printf '\n\033[1m\033[38;5;82mBootstrap concluído.\033[0m\n'
}

main "$@"
