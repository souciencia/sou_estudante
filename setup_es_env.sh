#!/usr/bin/env bash
# =============================================================================
# setup-elastic-env.sh
#
# Script de preparação de ambiente para Elasticsearch:
# 1. Gerencia arquivo .env com permissões seguras (600) e backup prévio.
# 2. Aguarda a inicialização saudável do cluster (health check + retries).
# 3. Valida a API Key existente (evita recriação desnecessária).
# 4. Gera nova API Key com Privilégio Mínimo (Role Descriptors / Index Patterns).
# 5. Opcionalmente invalida chaves antigas de mesmo nome e roda em modo CI.
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Estilização
# -----------------------------------------------------------------------------
readonly RESET='\033[0m'
readonly BOLD='\033[1m'
readonly TITLE_MAIN='\033[38;5;93m'
readonly CATEGORY_COLOR='\033[38;5;208m'
readonly CMD='\033[38;5;141m'
readonly MUTED='\033[38;5;242m'
readonly SUCCESS='\033[38;5;82m'
readonly WARNING='\033[38;5;220m'
readonly ERROR='\033[38;5;196m'

# -----------------------------------------------------------------------------
# Configuração Padrão
# -----------------------------------------------------------------------------
ENV_FILE="./.env"
ENV_EXAMPLE_FILE="./.env.example"
API_KEY_NAME="app-api-key"
API_KEY_EXPIRATION=""          # Ex: 30d (vazio = sem expiração)
CURL_TIMEOUT=10
CURL_INSECURE=false

# Novas flags e comportamentos
FORCE_RECREATE=false
NON_INTERACTIVE=false
DRY_RUN=false
INVALIDATE_OLD=false
WAIT_SECONDS=0                 # 0 = verifica uma vez e falha
ROLE_DESCRIPTORS_FILE=""
INDEX_PATTERN=""

CLI_USER=""
CLI_PASS=""

# Nomes das variáveis no .env
readonly VAR_URL="ELASTICSEARCH_URL"
readonly VAR_USER="ELASTICSEARCH_USERNAME"
readonly VAR_PASS="ELASTIC_PASSWORD"
readonly VAR_APIKEY="ELASTICSEARCH_APIKEY"

# -----------------------------------------------------------------------------
# UI / Log
# -----------------------------------------------------------------------------
print_line() {
  printf '%b\n' "${BOLD}${TITLE_MAIN}=================================================================${RESET}"
}

print_header() {
  print_line
  printf '%b\n' "${BOLD}${TITLE_MAIN}  $1${RESET}"
  print_line
  echo
}

print_step() { printf '%b\n' "\n${BOLD}${CATEGORY_COLOR}▶ $1${RESET}"; }
log_info()    { printf '%b\n' "  ${MUTED}•${RESET} $1"; }
log_success() { printf '%b\n' "  ${SUCCESS}✔${RESET} $1"; }
log_warn()    { printf '%b\n' "  ${WARNING}!${RESET} $1"; }
log_error()   { printf '%b\n' "  ${ERROR}✘ $1${RESET}" >&2; }

die() {
  log_error "$1"
  exit "${2:-1}"
}

# -----------------------------------------------------------------------------
# CLI / Argumentos
# -----------------------------------------------------------------------------
usage() {
  printf '%b\n' "${BOLD}Uso:${RESET} $(basename "$0") ${MUTED}[opções]${RESET}

${BOLD}${CATEGORY_COLOR}Opções Principais:${RESET}
  ${CMD}-e, --env-file <caminho>${RESET}        Arquivo .env de destino ${MUTED}(padrão: ${ENV_FILE})${RESET}
  ${CMD}-x, --example-file <caminho>${RESET}    Arquivo modelo ${MUTED}(padrão: ${ENV_EXAMPLE_FILE})${RESET}
  ${CMD}-n, --key-name <nome>${RESET}           Nome da API key ${MUTED}(padrão: ${API_KEY_NAME})${RESET}
  ${CMD}-t, --expiration <tempo>${RESET}        Expiração da chave, ex.: 30d ${MUTED}(padrão: sem expiração)${RESET}
  ${CMD}-f, --force${RESET}                     Força a criação de uma nova chave mesmo se a atual for válida
  ${CMD}    --invalidate-old${RESET}            Invalida chaves antigas com o mesmo nome após gerar a nova

${BOLD}${CATEGORY_COLOR}Segurança / Permissões (Privilégio Mínimo):${RESET}
  ${CMD}-r, --role-descriptors <json>${RESET}   Caminho para arquivo JSON com descritores de role
  ${CMD}-p, --index-pattern <pattern>${RESET}   Gera role padrão limitada ao pattern ex: \"meu-indice-*\"

${BOLD}${CATEGORY_COLOR}Automação e Resiliência:${RESET}
  ${CMD}-w, --wait <segundos>${RESET}           Segundos para aguardar o ES responder/ficar green/yellow ${MUTED}(padrão: 0)${RESET}
  ${CMD}    --non-interactive${RESET}         Modo CI: não faz perguntas no terminal
  ${CMD}-u, --username <usuario>${RESET}        Usuário ES (sobrescreve o .env)
  ${CMD}-P, --password <senha>${RESET}          Senha ES (sobrescreve o .env)
  ${CMD}    --dry-run${RESET}                 Simula as ações sem alterar o .env ou criar recursos

${BOLD}${CATEGORY_COLOR}Gerais:${RESET}
  ${CMD}    --timeout <segundos>${RESET}        Timeout do curl ${MUTED}(padrão: ${CURL_TIMEOUT})${RESET}
  ${CMD}-k, --insecure${RESET}                  Ignora validação do certificado TLS
  ${CMD}-h, --help${RESET}                      Exibe esta ajuda"
}

require_option_value() {
  [[ -n "${2:-}" ]] || die "A opção $1 requer um valor."
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -e|--env-file)         require_option_value "$1" "${2:-}"; ENV_FILE="$2"; shift 2 ;;
      -x|--example-file)     require_option_value "$1" "${2:-}"; ENV_EXAMPLE_FILE="$2"; shift 2 ;;
      -n|--key-name)         require_option_value "$1" "${2:-}"; API_KEY_NAME="$2"; shift 2 ;;
      -t|--expiration)       require_option_value "$1" "${2:-}"; API_KEY_EXPIRATION="$2"; shift 2 ;;
      -f|--force)            FORCE_RECREATE=true; shift ;;
      --invalidate-old)      INVALIDATE_OLD=true; shift ;;
      -r|--role-descriptors) require_option_value "$1" "${2:-}"; ROLE_DESCRIPTORS_FILE="$2"; shift 2 ;;
      -p|--index-pattern)     require_option_value "$1" "${2:-}"; INDEX_PATTERN="$2"; shift 2 ;;
      -w|--wait)             require_option_value "$1" "${2:-}"; WAIT_SECONDS="$2"; shift 2 ;;
      --non-interactive)     NON_INTERACTIVE=true; shift ;;
      -u|--username)         require_option_value "$1" "${2:-}"; CLI_USER="$2"; shift 2 ;;
      -P|--password)         require_option_value "$1" "${2:-}"; CLI_PASS="$2"; shift 2 ;;
      --dry-run)             DRY_RUN=true; shift ;;
      --timeout)             require_option_value "$1" "${2:-}"; CURL_TIMEOUT="$2"; shift 2 ;;
      -k|--insecure)         CURL_INSECURE=true; shift ;;
      -h|--help)             usage; exit 0 ;;
      *)                     usage; die "Opção desconhecida: $1" ;;
    esac
  done
}

# -----------------------------------------------------------------------------
# Utilitários
# -----------------------------------------------------------------------------
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

backup_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    local backup_file="${ENV_FILE}.bak"
    if [[ "$DRY_RUN" == true ]]; then
      log_info "[DRY-RUN] Criaria backup do arquivo .env em ${CMD}${backup_file}${RESET}"
    else
      cp "$ENV_FILE" "$backup_file"
      secure_file "$backup_file"
      log_info "Backup criado em ${CMD}${backup_file}${RESET}"
    fi
  fi
}

# -----------------------------------------------------------------------------
# Manipulação do .env
# -----------------------------------------------------------------------------
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
  KEY="$key" VALUE="$formatted" awk '
    BEGIN { k = ENVIRON["KEY"]; v = ENVIRON["VALUE"] }
    $0 ~ "^[[:space:]]*" k "=" { print k "=" v; next }
    { print }
  ' "$ENV_FILE" > "$tmp"
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
}

append_env_var() {
  ensure_trailing_newline
  printf '%s=%s\n' "$1" "$2" >> "$ENV_FILE"
}

set_env_var() {
  local key="$1" value="$2" formatted
  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Gravaria no .env: ${CMD}${key}${RESET}=${value}"
    return
  fi

  backup_env_file
  formatted="$(format_env_value "$value")"
  if env_var_exists "$key"; then
    update_env_var "$key" "$formatted"
  else
    append_env_var "$key" "$formatted"
  fi
  secure_file "$ENV_FILE"
}

# -----------------------------------------------------------------------------
# Etapa 1: Arquivo .env & Credenciais
# -----------------------------------------------------------------------------
ensure_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    log_info "Arquivo ${CMD}${ENV_FILE}${RESET} encontrado."
    secure_file "$ENV_FILE"
    return
  fi

  log_warn "Arquivo ${CMD}${ENV_FILE}${RESET} não existe."
  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Criaria ${ENV_FILE} a partir de ${ENV_EXAMPLE_FILE}"
    return
  fi

  [[ -f "$ENV_EXAMPLE_FILE" ]] || die "Modelo ${ENV_EXAMPLE_FILE} não encontrado."
  cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
  secure_file "$ENV_FILE"
  log_success "Criado ${CMD}${ENV_FILE}${RESET} a partir de ${CMD}${ENV_EXAMPLE_FILE}${RESET} com permissões 600."
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
    return
  fi

  current="$(get_env_var "$key")"
  if ! is_blank "$current"; then
    log_info "${CMD}${key}${RESET} já preenchido."
    return
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

# -----------------------------------------------------------------------------
# Etapa 2: Elasticsearch & Cluster Health
# -----------------------------------------------------------------------------
get_elasticsearch_url() {
  local url
  url="$(get_env_var "$VAR_URL")"
  is_blank "$url" && die "${VAR_URL} não está definido em ${ENV_FILE}."
  printf '%s' "${url%/}"
}

CURL_OPTS=()
build_curl_opts() {
  CURL_OPTS=(--silent --show-error --max-time "$CURL_TIMEOUT")
  [[ "$CURL_INSECURE" == true ]] && CURL_OPTS+=(--insecure)
  return 0
}

# Checa saúde real (_cluster/health) garantindo status green ou yellow
check_cluster_health() {
  local url="$1" response http_code body status
  
  response="$(curl "${CURL_OPTS[@]}" --write-out '\n%{http_code}' "${url}/_cluster/health" 2>/dev/null || true)"
  http_code="$(tail -n1 <<< "$response")"
  body="$(sed '$d' <<< "$response")"

  if [[ "$http_code" != "200" ]]; then
    return 1
  fi

  if command -v jq >/dev/null 2>&1; then
    status="$(jq -r '.status // empty' <<< "$body")"
  else
    status="$(sed -n 's/.*"status"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' <<< "$body")"
  fi

  if [[ "$status" == "green" || "$status" == "yellow" ]]; then
    return 0
  fi

  return 1
}

wait_for_elasticsearch() {
  local url="$1" elapsed=0 interval=3
  log_info "Verificando saúde do Elasticsearch em ${CMD}${url}${RESET}..."

  while true; do
    if check_cluster_health "$url"; then
      log_success "Elasticsearch está online e com status de cluster saudável."
      return 0
    fi

    if (( elapsed >= WAIT_SECONDS )); then
      break
    fi

    log_warn "Elasticsearch indisponível ou cluster em estado degradado/red. Aguardando (${elapsed}/${WAIT_SECONDS}s)..."
    sleep "$interval"
    (( elapsed += interval ))
  done

  die "Elasticsearch não respondeu adequadamente em ${url} dentro do tempo limite de ${WAIT_SECONDS}s."
}

# -----------------------------------------------------------------------------
# Etapa 3: API Keys & Privilégio Mínimo
# -----------------------------------------------------------------------------
validate_existing_api_key() {
  local url="$1" current_key
  current_key="$(get_env_var "$VAR_APIKEY")"

  if is_blank "$current_key" || [[ "$FORCE_RECREATE" == true ]]; then
    return 1
  fi

  log_info "Validando API key existente no ${ENV_FILE}..."
  
  local response http_code
  response="$(curl "${CURL_OPTS[@]}" --header "Authorization: ApiKey ${current_key}" \
    --write-out '\n%{http_code}' "${url}/_security/_authenticate" 2>/dev/null || true)"
  http_code="$(tail -n1 <<< "$response")"

  if [[ "$http_code" == "200" ]]; then
    log_success "A API key atual já é válida. Nenhuma ação necessária."
    return 0
  else
    log_warn "A API key atual é inválida, expirou ou foi revogada (HTTP ${http_code}). Uma nova será gerada."
    return 1
  fi
}

build_api_key_payload() {
  local role_descriptors=""

  if [[ -n "$ROLE_DESCRIPTORS_FILE" ]]; then
    [[ -f "$ROLE_DESCRIPTORS_FILE" ]] || die "Arquivo de role descriptors não encontrado: ${ROLE_DESCRIPTORS_FILE}"
    role_descriptors="$(cat "$ROLE_DESCRIPTORS_FILE")"
  elif [[ -n "$INDEX_PATTERN" ]]; then
    role_descriptors=$(cat <<EOF
{
  "app-role": {
    "cluster": ["monitor"],
    "indices": [
      {
        "names": ["${INDEX_PATTERN}"],
        "privileges": ["read", "write", "create_index", "view_index_metadata"]
      }
    ]
  }
}
EOF
)
  fi

  if command -v jq >/dev/null 2>&1; then
    jq -n \
      --arg name "$API_KEY_NAME" \
      --arg exp "$API_KEY_EXPIRATION" \
      --argjson rd "${role_descriptors:-null}" \
      '{name: $name} + (if $exp != "" then {expiration: $exp} else {} end) + (if $rd != null then {role_descriptors: $rd} else {} end)'
  else
    local payload="{\"name\":\"$(escape_quoted "$API_KEY_NAME")\""
    [[ -n "$API_KEY_EXPIRATION" ]] && payload+=",\"expiration\":\"$(escape_quoted "$API_KEY_EXPIRATION")\""
    if [[ -n "$role_descriptors" ]]; then
      payload+=",\"role_descriptors\":${role_descriptors}"
    fi
    printf '%s}' "$payload"
  fi
}

request_api_key() {
  local url="$1" user="$2" pass="$3" payload
  payload="$(build_api_key_payload)"

  printf 'user = "%s:%s"\n' "$(escape_quoted "$user")" "$(escape_quoted "$pass")" |
    curl "${CURL_OPTS[@]}" -K - \
      --request POST "${url}/_security/api_key" \
      --header 'Content-Type: application/json' \
      --data "$payload" \
      --write-out '\n%{http_code}'
}

extract_encoded_key() {
  local body="$1"
  if command -v jq >/dev/null 2>&1; then
    jq -r '.encoded // empty' <<< "$body"
  else
    sed -n 's/.*"encoded"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' <<< "$body"
  fi
}

generate_api_key() {
  local url="$1" user="$2" pass="$3"
  local response http_code body encoded

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Payload da requisição de API Key:"
    build_api_key_payload
    printf '\n'
    printf 'DRY_RUN_MOCK_API_KEY'
    return 0
  fi

  response="$(request_api_key "$url" "$user" "$pass")" || die "Falha na requisição ao Elasticsearch."
  http_code="$(tail -n1 <<< "$response")"
  body="$(sed '$d' <<< "$response")"

  case "$http_code" in
    200|201) ;;
    401) die "Credenciais inválidas (HTTP 401). Verifique usuário/senha em ${ENV_FILE}." ;;
    *)   die "Erro ao gerar API key (HTTP ${http_code}): ${body}" ;;
  esac

  encoded="$(extract_encoded_key "$body")"
  [[ -n "$encoded" ]] || die "Resposta sem o campo 'encoded': ${body}"
  printf '%s' "$encoded"
}

invalidate_old_keys() {
  local url="$1" user="$2" pass="$3" payload
  log_info "Invalidando chaves antigas com o nome ${CMD}${API_KEY_NAME}${RESET}..."

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Executaria DELETE /_security/api_key com name='${API_KEY_NAME}'"
    return 0
  fi

  payload="{\"name\":\"$(escape_quoted "$API_KEY_NAME")\"}"

  printf 'user = "%s:%s"\n' "$(escape_quoted "$user")" "$(escape_quoted "$pass")" |
    curl "${CURL_OPTS[@]}" -K - \
      --request DELETE "${url}/_security/api_key" \
      --header 'Content-Type: application/json' \
      --data "$payload" >/dev/null 2>&1 || log_warn "Não foi possível revogar chaves anteriores."

  log_success "Chaves antigas revogadas com sucesso."
}

save_api_key() {
  local api_key="$1"
  set_env_var "$VAR_APIKEY" "$api_key"
  if [[ "$DRY_RUN" == false ]]; then
    log_success "${CMD}${VAR_APIKEY}${RESET} salvo com sucesso em ${ENV_FILE}."
  fi
}

# -----------------------------------------------------------------------------
# Orquestração
# -----------------------------------------------------------------------------
setup_env_file() {
  print_step "1. Preparação do arquivo .env"
  ensure_env_file
  ensure_credentials
}

setup_api_key() {
  local url user pass api_key

  print_step "2. Gerenciamento da API Key do Elasticsearch"
  url="$(get_elasticsearch_url)"
  user="$(get_env_var "$VAR_USER")"
  pass="$(get_env_var "$VAR_PASS")"

  build_curl_opts
  wait_for_elasticsearch "$url"

  # Idempotência: só gera se for necessário ou forçado
  if validate_existing_api_key "$url"; then
    return 0
  fi

  log_info "Gerando nova API key (${CMD}${API_KEY_NAME}${RESET})..."
  if [[ -n "$ROLE_DESCRIPTORS_FILE" ]]; then
    log_info "Aplicando privilégios restritos do arquivo JSON: ${ROLE_DESCRIPTORS_FILE}"
  elif [[ -n "$INDEX_PATTERN" ]]; then
    log_info "Aplicando privilégios restritos para o pattern: ${INDEX_PATTERN}"
  else
    log_warn "Nenhum descritor de role informado. A chave herdará as permissões do usuário."
  fi

  api_key="$(generate_api_key "$url" "$user" "$pass")"
  log_success "Nova API key gerada com sucesso."

  save_api_key "$api_key"

  if [[ "$INVALIDATE_OLD" == true ]]; then
    invalidate_old_keys "$url" "$user" "$pass"
  fi
}

main() {
  parse_args "$@"
  require_command curl

  print_header "Setup do ambiente Elasticsearch"
  
  if [[ "$DRY_RUN" == true ]]; me
    log_warn "Modo --dry-run ativo. Nenhuma alteração real será feita."
  fi

  setup_env_file
  setup_api_key

  printf '%b\n' "\n${BOLD}${SUCCESS}Tudo pronto!${RESET}\n"
}

main "$@"