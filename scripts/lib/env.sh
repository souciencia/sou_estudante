# Leitura e escrita do arquivo .env, compartilhadas pelos scripts.
# Requer as variáveis globais ENV_FILE, ENV_EXAMPLE_FILE e DRY_RUN definidas.

readonly VAR_URL="ELASTICSEARCH_URL"
readonly VAR_USER="ELASTICSEARCH_USERNAME"
readonly VAR_PASS="ELASTIC_PASSWORD"
readonly VAR_APIKEY="ELASTICSEARCH_APIKEY"
readonly VAR_BULK_APIKEY="ELASTICSEARCH_BULK_APIKEY"

get_env_var() {
  local key="$1" value
  value="$(grep -E "^[[:space:]]*${key}=" "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
  value="${value%$'\r'}"
  if [[ "$value" =~ ^\"(.*)\"$ ]] || [[ "$value" =~ ^\'(.*)\'$ ]]; then
    value="${BASH_REMATCH[1]}"
  fi
  printf '%s' "$value"
}

format_env_value() {
  local value="$1"
  if [[ "$value" =~ [[:space:]#] ]]; then
    printf '"%s"' "$(escape_quoted "$value")"
  else
    printf '%s' "$value"
  fi
}

env_var_exists() {
  grep -qE "^[[:space:]]*${1}=" "$ENV_FILE"
}

ensure_trailing_newline() {
  if [[ -s "$ENV_FILE" && -n "$(tail -c1 "$ENV_FILE")" ]]; then
    printf '\n' >> "$ENV_FILE"
  fi
}

update_env_var() {
  local key="$1" formatted="$2" tmp
  tmp="$(mktemp)"
  chmod 600 "$tmp"
  KEY="$key" VALUE="$formatted" awk '
    BEGIN { k = ENVIRON["KEY"]; v = ENVIRON["VALUE"] }
    $0 ~ "^[[:space:]]*" k "=" { print k "=" v; next }
    { print }
  ' "$ENV_FILE" > "$tmp"
  mv -f "$tmp" "$ENV_FILE"
}

append_env_var() {
  ensure_trailing_newline
  printf '%s=%s\n' "$1" "$2" >> "$ENV_FILE"
}

set_env_var() {
  local key="$1" value="$2" formatted
  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Gravaria no .env: ${CMD}${key}${RESET}=${value}"
    return 0
  fi

  formatted="$(format_env_value "$value")"
  if env_var_exists "$key"; then
    update_env_var "$key" "$formatted"
  else
    append_env_var "$key" "$formatted"
  fi
  secure_file "$ENV_FILE"
}

backup_env_file() {
  if [[ -f "$ENV_FILE" && "$BACKUP_ENV" == true ]]; then
    local backup_file="${ENV_FILE}.bak"
    if [[ "$DRY_RUN" == true ]]; then
      log_info "[DRY-RUN] Criaria backup do .env em ${CMD}${backup_file}${RESET}"
    else
      cp "$ENV_FILE" "$backup_file"
      secure_file "$backup_file"
      log_info "Backup do .env anterior em ${CMD}${backup_file}${RESET} (permissões 600)."
    fi
  fi
}

create_env_from_example() {
  [[ -f "$ENV_EXAMPLE_FILE" ]] || die "Modelo ${ENV_EXAMPLE_FILE} não encontrado."
  cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
  secure_file "$ENV_FILE"
  log_success "Criado ${CMD}${ENV_FILE}${RESET} a partir de ${CMD}${ENV_EXAMPLE_FILE}${RESET} com permissões 600."
}

reset_env_file() {
  if [[ "$KEEP_ENV" == true ]]; then
    log_info "Mantendo o ${CMD}${ENV_FILE}${RESET} existente (--keep-env)."
    if [[ ! -f "$ENV_FILE" ]]; then
      if [[ "$DRY_RUN" == true ]]; then
        log_info "[DRY-RUN] Criaria ${ENV_FILE} a partir de ${ENV_EXAMPLE_FILE}."
        return 0
      fi
      create_env_from_example
    else
      secure_file "$ENV_FILE"
    fi
    return 0
  fi

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Apagaria ${ENV_FILE} e o recriaria a partir de ${ENV_EXAMPLE_FILE}."
    return 0
  fi

  backup_env_file
  rm -f "$ENV_FILE"
  log_info "${CMD}${ENV_FILE}${RESET} anterior removido."
  create_env_from_example
}

prompt_value() {
  local label="$1" value=""
  read -r -p "$(printf '%b' "  ${CATEGORY_COLOR}?${RESET} ${label}: ")" value || die "Entrada interrompida."
  printf '%s' "$value"
}

prompt_secret() {
  local label="$1" value=""
  read -r -s -p "$(printf '%b' "  ${CATEGORY_COLOR}?${RESET} ${label}: ")" value || die "Entrada interrompida."
  echo >&2
  printf '%s' "$value"
}

ensure_env_var_filled() {
  local key="$1" secret="${2:-false}" cli_override="${3:-}" current input=""

  if [[ -n "$cli_override" ]]; then
    set_env_var "$key" "$cli_override"
    log_success "${CMD}${key}${RESET} definido via parâmetro/ambiente."
    return 0
  fi

  current="$(get_env_var "$key")"
  if ! is_blank "$current"; then
    log_info "${CMD}${key}${RESET} já preenchido."
    return 0
  fi

  if [[ "$NON_INTERACTIVE" == true ]]; then
    die "Modo não interativo ativo e a variável ${key} não está preenchida no .env ou via argumento."
  fi

  log_warn "${CMD}${key}${RESET} não está preenchido."
  while is_blank "$input"; do
    if [[ "$secret" == true ]]; then
      input="$(prompt_secret "Informe ${key}")"
    else
      input="$(prompt_value "Informe ${key}")"
    fi
    is_blank "$input" && log_error "O valor não pode ser vazio."
  done

  set_env_var "$key" "$input"
  log_success "${CMD}${key}${RESET} salvo em ${ENV_FILE}."
}

ensure_credentials() {
  ensure_env_var_filled "$VAR_USER" false "$CLI_USER"
  ensure_env_var_filled "$VAR_PASS" true "$CLI_PASS"
}
