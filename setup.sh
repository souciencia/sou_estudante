#!/usr/bin/env bash
# =============================================================================
# setup.sh
#
# Bootstrap do ambiente local do SoU_Estudante (executado FORA dos containers):
#
#   1. Recria o .env a partir do .env.example (permissões 600, backup opcional).
#   2. Garante as credenciais do Elasticsearch no .env.
#   3. Sobe o container do Elasticsearch (se necessário) e aguarda ficar pronto.
#   4. Revoga as API Keys gerenciadas e gera novas com privilégio mínimo.
#   5. Grava as novas chaves no .env.
#   6. Executa o job do container de bulking (se_bulker).
#   7. Verifica se já existem índices no Elasticsearch.
#   8. Informa os próximos passos (bulking via container se_bulker).
#
# O script fala com o Elasticsearch pelo host (http://localhost:9200 por
# padrão), enquanto o .env mantém a URL interna (http://se_es01:9200) usada
# pelos containers.
# =============================================================================

set -euo pipefail

umask 077

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
BULKER_API_KEY_NAME="bulker-api-key"
API_KEY_EXPIRATION=""          # Ex: 30d (vazio = sem expiração)
API_INDEX_PATTERN="cursos,dicionario_cursos"
BULKER_INDEX_PATTERN="cursos,dicionario_cursos"

# URL usada pelo PRÓPRIO script (host). O .env continua com a URL interna.
ES_HOST_URL="${ES_HOST_URL:-http://localhost:9200}"
ES_SERVICE="se_es01"           # nome do serviço no docker-compose
ES_CONTAINER=""                # vazio = resolve via ESNODE01_NAME do .env
BULKER_SERVICE="se_bulker"
BULKER_PROFILE="bulker"

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
SKIP_BULKER=false
API_ROLE_DESCRIPTORS_FILE=""
BULKER_ROLE_DESCRIPTORS_FILE=""

CLI_USER=""
CLI_PASS=""

# Comandos detectados em tempo de execução
CONTAINER_ENGINE=""
COMPOSE_CMD=()

# Nomes das variáveis no .env
readonly VAR_URL="ELASTICSEARCH_URL"
readonly VAR_USER="ELASTICSEARCH_USERNAME"
readonly VAR_PASS="ELASTIC_PASSWORD"
readonly VAR_APIKEY="ELASTICSEARCH_APIKEY"
readonly VAR_BULKER_APIKEY="ELASTICSEARCH_BULKER_APIKEY"

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

${BOLD}${CATEGORY_COLOR}Arquivos e credenciais:${RESET}
  ${CMD}-e, --env-file <caminho>${RESET}        Arquivo .env de destino ${MUTED}(padrão: ${ENV_FILE})${RESET}
  ${CMD}-x, --example-file <caminho>${RESET}    Arquivo modelo ${MUTED}(padrão: ${ENV_EXAMPLE_FILE})${RESET}
  ${CMD}    --keep-env${RESET}                  Não recria o .env a partir do exemplo
  ${CMD}    --no-backup${RESET}                 Não faz backup do .env anterior
  ${CMD}-u, --username <usuario>${RESET}        Usuário ES (sobrescreve o .env)
  ${CMD}-P, --password <senha>${RESET}          Senha ES (sobrescreve o .env)

${BOLD}${CATEGORY_COLOR}Elasticsearch / containers:${RESET}
  ${CMD}    --url <url>${RESET}                 URL do ES vista do host ${MUTED}(padrão: ${ES_HOST_URL})${RESET}
  ${CMD}    --es-service <nome>${RESET}         Serviço do ES no compose ${MUTED}(padrão: ${ES_SERVICE})${RESET}
  ${CMD}    --es-container <nome>${RESET}       Nome do container do ES ${MUTED}(padrão: ESNODE01_NAME)${RESET}
  ${CMD}-w, --wait <segundos>${RESET}           Espera o ES ficar pronto; 0 = sem limite ${MUTED}(padrão: ${WAIT_SECONDS})${RESET}
  ${CMD}    --skip-es-up${RESET}                Não tenta subir o ES (apenas aguarda)
  ${CMD}    --skip-bulker${RESET}              Não executa o container de bulking
  ${CMD}    --bulker-service <nome>${RESET}     Serviço do bulker ${MUTED}(padrão: ${BULKER_SERVICE})${RESET}
  ${CMD}    --bulker-profile <nome>${RESET}     Profile do bulker ${MUTED}(padrão: ${BULKER_PROFILE})${RESET}

${BOLD}${CATEGORY_COLOR}API Keys (Privilégio Mínimo):${RESET}
  ${CMD}-n, --key-name <nome>${RESET}           Nome da API key somente leitura ${MUTED}(padrão: ${API_KEY_NAME})${RESET}
  ${CMD}    --bulker-key-name <nome>${RESET}    Nome da API key do bulker ${MUTED}(padrão: ${BULKER_API_KEY_NAME})${RESET}
  ${CMD}-t, --expiration <tempo>${RESET}        Expiração das chaves, ex.: 30d ${MUTED}(padrão: sem expiração)${RESET}
  ${CMD}    --reuse-valid-keys${RESET}          Reutiliza chaves válidas (não recria)
  ${CMD}    --purge-all-keys${RESET}            Revoga TODAS as API Keys antes de gerar ${MUTED}(perigoso)${RESET}
  ${CMD}    --api-role-descriptors <json>${RESET} Caminho para JSON de role descriptors da API (leitura)
  ${CMD}    --bulker-role-descriptors <json>${RESET} Caminho para JSON de role descriptors do bulker
  ${CMD}    --api-pattern <pattern>${RESET}     Índices da chave de leitura ${MUTED}(padrão: ${API_INDEX_PATTERN})${RESET}
  ${CMD}-p, --index-pattern <pattern>${RESET}   Índices da chave do bulker ${MUTED}(padrão: ${BULKER_INDEX_PATTERN})${RESET}

${BOLD}${CATEGORY_COLOR}Gerais:${RESET}
  ${CMD}    --non-interactive${RESET}           Modo CI: não faz perguntas no terminal
  ${CMD}    --dry-run${RESET}                   Simula as ações sem alterar o .env ou criar recursos
  ${CMD}    --timeout <segundos>${RESET}        Timeout do curl ${MUTED}(padrão: ${CURL_TIMEOUT})${RESET}
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
      --skip-bulker)          SKIP_BULKER=true; shift ;;
      --bulker-service)       require_option_value "$1" "${2:-}"; BULKER_SERVICE="$2"; shift 2 ;;
      --bulker-profile)       require_option_value "$1" "${2:-}"; BULKER_PROFILE="$2"; shift 2 ;;
      -n|--key-name)          require_option_value "$1" "${2:-}"; API_KEY_NAME="$2"; shift 2 ;;
      --bulker-key-name)      require_option_value "$1" "${2:-}"; BULKER_API_KEY_NAME="$2"; shift 2 ;;
      -t|--expiration)        require_option_value "$1" "${2:-}"; API_KEY_EXPIRATION="$2"; shift 2 ;;
      --reuse-valid-keys)     REUSE_VALID_KEYS=true; shift ;;
      --purge-all-keys)       PURGE_ALL_KEYS=true; shift ;;
      --api-role-descriptors) require_option_value "$1" "${2:-}"; API_ROLE_DESCRIPTORS_FILE="$2"; shift 2 ;;
      --bulker-role-descriptors) require_option_value "$1" "${2:-}"; BULKER_ROLE_DESCRIPTORS_FILE="$2"; shift 2 ;;
      --api-pattern)          require_option_value "$1" "${2:-}"; API_INDEX_PATTERN="$2"; shift 2 ;;
      -p|--index-pattern)     require_option_value "$1" "${2:-}"; BULKER_INDEX_PATTERN="$2"; shift 2 ;;
      --non-interactive)      NON_INTERACTIVE=true; shift ;;
      --dry-run)              DRY_RUN=true; shift ;;
      --timeout)              require_option_value "$1" "${2:-}"; CURL_TIMEOUT="$2"; shift 2 ;;
      -k|--insecure)          CURL_INSECURE=true; shift ;;
      -f|--force|--invalidate-old) shift ;;
      -h|--help)              usage; exit 0 ;;
      *)                      usage; die "Opção desconhecida: $1" ;;
    esac
  done
}

# -----------------------------------------------------------------------------
# Detecção de ferramentas (podman/docker)
# -----------------------------------------------------------------------------
require_engine() {
  [[ -n "$CONTAINER_ENGINE" ]] && return 0
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
  else
    printf 'podman compose'
  fi
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

# -----------------------------------------------------------------------------
# Etapa 1: Recriação do .env & Credenciais
# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
# Etapa 2: Elasticsearch & Cluster Health
# -----------------------------------------------------------------------------
resolve_host_url() {
  is_blank "$ES_HOST_URL" && die "URL do Elasticsearch (--url) não pode ser vazia."
  printf '%s' "${ES_HOST_URL%/}"
}

resolve_es_container() {
  if [[ -n "$ES_CONTAINER" ]]; then
    printf '%s' "$ES_CONTAINER"
    return 0
  fi
  local name
  name="$(get_env_var "ESNODE01_NAME")"
  is_blank "$name" && name="se_es01"
  printf '%s' "$name"
}

CURL_OPTS=()
build_curl_opts() {
  CURL_OPTS=(--silent --show-error --max-time "$CURL_TIMEOUT")
  [[ "$CURL_INSECURE" == true ]] && CURL_OPTS+=(--insecure)
  return 0
}

curl_with_basic_auth() {
  local user="$1" pass="$2"
  shift 2
  printf 'user = "%s:%s"\n' "$(escape_quoted "$user")" "$(escape_quoted "$pass")" |
    curl "${CURL_OPTS[@]}" -K - "$@"
}

curl_with_api_key() {
  local key="$1"
  shift
  curl "${CURL_OPTS[@]}" --header "Authorization: ApiKey ${key}" "$@"
}

ensure_elasticsearch_up() {
  local container="$1"

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Verificaria o container ${container} e, se necessário, rodaria: $(compose_display) up -d ${ES_SERVICE}"
    return 0
  fi

  if container_is_running "$container"; then
    log_success "Elasticsearch já está em execução (${container})."
    return 0
  fi

  if [[ "$SKIP_ES_UP" == true ]]; then
    log_warn "Elasticsearch (${container}) não está em execução; --skip-es-up ativo, aguardando sem subir."
    return 0
  fi

  require_compose
  log_info "Subindo o Elasticsearch (${ES_SERVICE})..."
  "${COMPOSE_CMD[@]}" up -d "$ES_SERVICE"
}

# Checa saúde real (_cluster/health) garantindo status green ou yellow.
check_cluster_health() {
  local url="$1" user="$2" pass="$3" response http_code body status

  response="$(curl_with_basic_auth "$user" "$pass" \
    --write-out '\n%{http_code}' "${url}/_cluster/health" 2>/dev/null || true)"
  http_code="$(tail -n1 <<< "$response")"
  body="$(sed '$d' <<< "$response")"

  [[ "$http_code" == "200" ]] || return 1

  if command -v jq >/dev/null 2>&1; then
    status="$(jq -r '.status // empty' <<< "$body")"
  else
    status="$(sed -n 's/.*"status"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' <<< "$body")"
  fi

  [[ "$status" == "green" || "$status" == "yellow" ]]
}

wait_for_elasticsearch() {
  local url="$1" user="$2" pass="$3" elapsed=0 interval=3

  log_info "Aguardando o Elasticsearch ficar pronto em ${CMD}${url}${RESET}..."

  while true; do
    if check_cluster_health "$url" "$user" "$pass"; then
      log_success "Elasticsearch online e com cluster saudável."
      return 0
    fi

    if (( WAIT_SECONDS > 0 && elapsed >= WAIT_SECONDS )); then
      die "Elasticsearch não respondeu adequadamente em ${url} dentro de ${WAIT_SECONDS}s. Verifique as credenciais em ${ENV_FILE} e os logs do container."
    fi

    log_warn "Elasticsearch indisponível ou cluster em estado degradado/red (${elapsed}s). Aguardando..."
    sleep "$interval"
    elapsed=$(( elapsed + interval ))
  done
}

# -----------------------------------------------------------------------------
# Etapa 3: API Keys & Privilégio Mínimo
# -----------------------------------------------------------------------------
validate_existing_api_key() {
  local url="$1" var_name="$2" label="$3" current_key
  current_key="$(get_env_var "$var_name")"

  is_blank "$current_key" && return 1

  log_info "Validando ${label} existente no ${ENV_FILE}..."

  local response http_code
  response="$(curl_with_api_key "$current_key" \
    --write-out '\n%{http_code}' "${url}/_security/_authenticate" 2>/dev/null || true)"
  http_code="$(tail -n1 <<< "$response")"

  if [[ "$http_code" == "200" ]]; then
    log_success "A ${label} atual já é válida. Nenhuma ação necessária."
    return 0
  fi

  log_warn "A ${label} atual é inválida, expirou ou foi revogada (HTTP ${http_code}). Uma nova será gerada."
  return 1
}

# Converte um pattern separado por vírgula em um array JSON de nomes de índice.
# O Elasticsearch trata cada elemento de "names" como um index pattern (aceita
# wildcards e regex), não como uma lista separada por vírgula.
build_index_names_json() {
  local pattern="$1"

  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$pattern" | jq -R 'split(",") | map(gsub("^\\s+|\\s+$"; "")) | map(select(length > 0))'
    return 0
  fi

  local IFS=',' name json="[" first=true
  for name in $pattern; do
    name="${name#"${name%%[![:space:]]*}"}"
    name="${name%"${name##*[![:space:]]}"}"
    [[ -n "$name" ]] || continue
    if [[ "$first" == true ]]; then
      first=false
    else
      json+=","
    fi
    json+="\"$(escape_quoted "$name")\""
  done
  json+="]"
  printf '%s' "$json"
}

build_read_role_descriptors() {
  local pattern="$1" names
  names="$(build_index_names_json "$pattern")"
  cat <<EOF
{
  "app-read-role": {
    "indices": [
      {
        "names": ${names},
        "privileges": ["read"]
      }
    ]
  }
}
EOF
}

build_bulker_role_descriptors() {
  local pattern="$1" names
  names="$(build_index_names_json "$pattern")"
  cat <<EOF
{
  "app-bulker-role": {
    "cluster": ["monitor"],
    "indices": [
      {
        "names": ${names},
        "privileges": ["read", "write", "create_index", "delete_index", "view_index_metadata", "maintenance"]
      }
    ]
  }
}
EOF
}

build_api_key_payload() {
  local key_name="$1" role_descriptors="$2"

  if command -v jq >/dev/null 2>&1; then
    jq -n \
      --arg name "$key_name" \
      --arg exp "$API_KEY_EXPIRATION" \
      --argjson rd "${role_descriptors:-null}" \
      '{name: $name} + (if $exp != "" then {expiration: $exp} else {} end) + (if $rd != null then {role_descriptors: $rd} else {} end)'
  else
    local payload="{\"name\":\"$(escape_quoted "$key_name")\""
    [[ -n "$API_KEY_EXPIRATION" ]] && payload+=",\"expiration\":\"$(escape_quoted "$API_KEY_EXPIRATION")\""
    if [[ -n "$role_descriptors" ]]; then
      payload+=",\"role_descriptors\":${role_descriptors}"
    fi
    printf '%s}' "$payload"
  fi
}

request_api_key() {
  local url="$1" user="$2" pass="$3" payload="$4"

  curl_with_basic_auth "$user" "$pass" \
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
  local url="$1" user="$2" pass="$3" key_name="$4" role_descriptors="$5"
  local payload response http_code body encoded

  payload="$(build_api_key_payload "$key_name" "$role_descriptors")"

  if [[ "$DRY_RUN" == true ]]; then
    printf '%b\n' "  ${MUTED}•${RESET} [DRY-RUN] Payload da requisição de API Key (${key_name}):" >&2
    printf '%s\n' "$payload" >&2
    printf 'DRY_RUN_MOCK_API_KEY'
    return 0
  fi

  response="$(request_api_key "$url" "$user" "$pass" "$payload")" || die "Falha na requisição ao Elasticsearch."
  http_code="$(tail -n1 <<< "$response")"
  body="$(sed '$d' <<< "$response")"

  case "$http_code" in
    200|201) ;;
    401) die "Credenciais inválidas (HTTP 401). A senha em ${ENV_FILE} não confere com a do volume do Elasticsearch existente." ;;
    *)   die "Erro ao gerar API key (HTTP ${http_code}): ${body}" ;;
  esac

  encoded="$(extract_encoded_key "$body")"
  [[ -n "$encoded" ]] || die "Resposta sem o campo 'encoded': ${body}"
  printf '%s' "$encoded"
}

delete_api_keys_by_name() {
  local url="$1" user="$2" pass="$3" key_name="$4" payload response http_code

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Revogaria as chaves com o nome ${CMD}${key_name}${RESET}."
    return 0
  fi

  payload="{\"name\":\"$(escape_quoted "$key_name")\"}"
  response="$(curl_with_basic_auth "$user" "$pass" \
    --request DELETE "${url}/_security/api_key" \
    --header 'Content-Type: application/json' \
    --data "$payload" \
    --write-out '\n%{http_code}' 2>/dev/null || true)"
  http_code="$(tail -n1 <<< "$response")"

  if [[ "$http_code" =~ ^2 ]]; then
    log_success "Chaves antigas '${key_name}' revogadas."
  else
    log_warn "Não foi possível revogar as chaves '${key_name}' (HTTP ${http_code}). Seguindo para a criação."
  fi
}

purge_all_api_keys() {
  local url="$1" user="$2" pass="$3" response http_code body id_list="" id payload

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Revogaria TODAS as API Keys do cluster."
    return 0
  fi

  response="$(curl_with_basic_auth "$user" "$pass" \
    --write-out '\n%{http_code}' "${url}/_security/api_key?format=json" 2>/dev/null || true)"
  http_code="$(tail -n1 <<< "$response")"
  body="$(sed '$d' <<< "$response")"

  if [[ "$http_code" != "200" ]]; then
    log_warn "Não foi possível listar as API Keys (HTTP ${http_code})."
    return 0
  fi

  while IFS= read -r id; do
    [[ -z "$id" ]] && continue
    [[ -n "$id_list" ]] && id_list+=","
    id_list+="\"$(escape_quoted "$id")\""
  done < <(printf '%s' "$body" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' \
    | sed 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/' || true)

  if [[ -z "$id_list" ]]; then
    log_info "Nenhuma API Key encontrada para revogar."
    return 0
  fi

  payload="{\"ids\":[${id_list}]}"
  curl_with_basic_auth "$user" "$pass" \
    --request DELETE "${url}/_security/api_key" \
    --header 'Content-Type: application/json' \
    --data "$payload" >/dev/null 2>&1 || log_warn "Falha ao revogar algumas API Keys."
  log_success "API Keys existentes revogadas (--purge-all-keys)."
}

save_api_key() {
  local var_name="$1" api_key="$2" label="$3"
  set_env_var "$var_name" "$api_key"
  if [[ "$DRY_RUN" == false ]]; then
    log_success "${CMD}${var_name}${RESET} (${label}) salvo em ${ENV_FILE}."
  fi
}

setup_single_api_key() {
  local label="$1" key_name="$2" var_name="$3" role_descriptors="$4"
  local url="$5" user="$6" pass="$7"
  local api_key

  if [[ "$REUSE_VALID_KEYS" == true ]] && validate_existing_api_key "$url" "$var_name" "$label"; then
    return 0
  fi

  delete_api_keys_by_name "$url" "$user" "$pass" "$key_name"

  log_info "Gerando ${label} (${CMD}${key_name}${RESET})..."
  api_key="$(generate_api_key "$url" "$user" "$pass" "$key_name" "$role_descriptors")"
  log_success "${label} gerada com sucesso."

  save_api_key "$var_name" "$api_key" "$label"
}

setup_api_keys() {
  local url="$1" user pass api_role_descriptors bulker_role_descriptors

  print_step "3. Gerenciamento das API Keys do Elasticsearch"
  user="$(get_env_var "$VAR_USER")"
  pass="$(get_env_var "$VAR_PASS")"

  if [[ "$PURGE_ALL_KEYS" == true ]]; then
    log_warn "Modo --purge-all-keys: todas as API Keys do cluster serão revogadas."
    purge_all_api_keys "$url" "$user" "$pass"
  fi

  if [[ -n "$API_ROLE_DESCRIPTORS_FILE" ]]; then
    [[ -f "$API_ROLE_DESCRIPTORS_FILE" ]] || die "Arquivo de role descriptors da API não encontrado: ${API_ROLE_DESCRIPTORS_FILE}"
    api_role_descriptors="$(cat "$API_ROLE_DESCRIPTORS_FILE")"
    log_info "Aplicando privilégios restritos da API do arquivo: ${API_ROLE_DESCRIPTORS_FILE}"
  else
    api_role_descriptors="$(build_read_role_descriptors "$API_INDEX_PATTERN")"
    log_info "Chave de leitura limitada ao pattern: ${API_INDEX_PATTERN}"
  fi

  if [[ -n "$BULKER_ROLE_DESCRIPTORS_FILE" ]]; then
    [[ -f "$BULKER_ROLE_DESCRIPTORS_FILE" ]] || die "Arquivo de role descriptors do bulker não encontrado: ${BULKER_ROLE_DESCRIPTORS_FILE}"
    bulker_role_descriptors="$(cat "$BULKER_ROLE_DESCRIPTORS_FILE")"
    log_info "Aplicando privilégios restritos do bulker do arquivo: ${BULKER_ROLE_DESCRIPTORS_FILE}"
  else
    bulker_role_descriptors="$(build_bulker_role_descriptors "$BULKER_INDEX_PATTERN")"
    log_info "Chave do bulker limitada ao pattern: ${BULKER_INDEX_PATTERN}"
  fi

  setup_single_api_key "API Key (somente leitura)" "$API_KEY_NAME" "$VAR_APIKEY" "$api_role_descriptors" "$url" "$user" "$pass"
  setup_single_api_key "API Key do bulker (leitura/escrita)" "$BULKER_API_KEY_NAME" "$VAR_BULKER_APIKEY" "$bulker_role_descriptors" "$url" "$user" "$pass"
}

# -----------------------------------------------------------------------------
# Etapa 4: Container de bulking (job one-shot)
# -----------------------------------------------------------------------------
start_bulker() {
  print_step "4. Container de bulking (${BULKER_SERVICE})"

  if [[ "$SKIP_BULKER" == true ]]; then
    log_info "Etapa ignorada (--skip-bulker)."
    return 0
  fi

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Executaria: $(compose_display) --profile ${BULKER_PROFILE} run --rm --no-deps ${BULKER_SERVICE}"
    return 0
  fi

  local data_file="./packages/bulker/data/dados_curso_completo.json"
  if [[ ! -f "$data_file" ]]; then
    log_warn "Arquivo de dados não encontrado em ${data_file}; bulking ignorado."
    log_info "Coloque o JSON da equipe de dados nesse caminho e rode novamente."
    return 0
  fi

  require_compose

  log_info "Executando o job de bulking..."
  if "${COMPOSE_CMD[@]}" --profile "$BULKER_PROFILE" run --rm --no-deps "$BULKER_SERVICE"; then
    log_success "Container de bulking executado com sucesso."
  else
    die "Falha ao executar o container de bulking. Verifique se a imagem foi construída: $(compose_display) --profile ${BULKER_PROFILE} build"
  fi
}

# -----------------------------------------------------------------------------
# Etapa 5: Índices existentes
# -----------------------------------------------------------------------------
check_indices() {
  local url="$1" key response http_code body names

  print_step "5. Índices existentes no Elasticsearch"
  key="$(get_env_var "$VAR_BULKER_APIKEY")"

  if is_blank "$key"; then
    log_warn "API key do bulker indisponível; pulando a verificação de índices."
    return 0
  fi

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Consultaria ${url}/_cat/indices com a chave do bulker."
    return 0
  fi

  response="$(curl_with_api_key "$key" \
    --write-out '\n%{http_code}' "${url}/_cat/indices?format=json&h=index" 2>/dev/null || true)"
  http_code="$(tail -n1 <<< "$response")"
  body="$(sed '$d' <<< "$response")"

  if [[ "$http_code" != "200" ]]; then
    log_warn "Não foi possível listar os índices (HTTP ${http_code})."
    return 0
  fi

  if command -v jq >/dev/null 2>&1; then
    names="$(jq -r '.[].index' <<< "$body" | grep -v '^\.' || true)"
  else
    names="$(grep -o '"index"[[:space:]]*:[[:space:]]*"[^"]*"' <<< "$body" \
      | sed 's/.*"index"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/' | grep -v '^\.' || true)"
  fi

  if [[ -z "$names" ]]; then
    log_warn "Nenhum índice de aplicação encontrado. O banco ainda não foi populado."
  else
    log_success "Índices encontrados:"
    while IFS= read -r name; do
      [[ -n "$name" ]] && printf '      %s\n' "$name"
    done <<< "$names"
  fi
}

# -----------------------------------------------------------------------------
# Resumo
# -----------------------------------------------------------------------------
print_summary() {
  local compose_cmd
  compose_cmd="$(compose_display)"

  echo
  print_line
  printf '%b\n' "${BOLD}${SUCCESS}  Setup concluído!${RESET}"
  print_line
  log_success "API Keys prontas e salvas em ${CMD}${ENV_FILE}${RESET} (permissões 600)."
  if [[ "$SKIP_BULKER" == true ]]; then
    log_warn "Container de bulking não foi executado (--skip-bulker)."
  else
    log_success "Container de bulking (${BULKER_SERVICE}) executado com sucesso."
  fi
  echo
  log_info "Próximos passos — reindexação de dados pelo container de bulking:"
  printf '      %s\n' "${compose_cmd} --profile ${BULKER_PROFILE} run --rm --no-deps ${BULKER_SERVICE}"
  echo
  log_info "Depois suba a API e o front: ${CMD}${compose_cmd} up -d se_api se_front${RESET}"
  echo
}

# -----------------------------------------------------------------------------
# Orquestração
# -----------------------------------------------------------------------------
main() {
  parse_args "$@"
  require_command curl
  build_curl_opts

  print_header "Setup do ambiente SoU_Estudante (Elasticsearch + Bulker)"

  if [[ "$DRY_RUN" == true ]]; then
    log_warn "Modo --dry-run ativo. Nenhuma alteração real será feita."
  fi

  print_step "1. Arquivo .env"
  reset_env_file

  print_step "2. Credenciais do Elasticsearch"
  ensure_credentials

  local url es_container
  url="$(resolve_host_url)"
  es_container="$(resolve_es_container)"

  print_step "2b. Elasticsearch"
  ensure_elasticsearch_up "$es_container"
  if [[ "$DRY_RUN" == false ]]; then
    wait_for_elasticsearch "$url" "$(get_env_var "$VAR_USER")" "$(get_env_var "$VAR_PASS")"
  fi

  setup_api_keys "$url"
  start_bulker
  check_indices "$url"

  print_summary
}

main "$@"
