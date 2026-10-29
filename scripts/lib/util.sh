# Utilitários gerais compartilhados pelos scripts (não dependem de .env).

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Comando obrigatório não encontrado: $1"
}

is_blank() {
  [[ -z "${1//[[:space:]]/}" ]]
}

escape_quoted() {
  local value="${1//\\/\\\\}"
  printf '%s' "${value//\"/\\\"}"
}

secure_file() {
  local file="$1"
  if [[ -f "$file" && "$DRY_RUN" == false ]]; then
    chmod 600 "$file" 2>/dev/null || true
  fi
}
