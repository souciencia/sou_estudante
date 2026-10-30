# Operações sobre o Elasticsearch: saúde do cluster, espera de prontidão e
# geração de API keys. Suporta dois transportes: host (dev, via URL no host) e
# container (prod, via `podman exec` dentro do ES, que não publica porta).

# ---------------------------------------------------------------------------
# Builders compartilhados (role descriptors e payload de API key)
# ---------------------------------------------------------------------------

# Converte um pattern separado por vírgula em um array JSON de nomes de índice.
build_index_names_json() {
  local pattern="$1"

  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$pattern" | jq -R 'split(",") | map(gsub("^\\s+|\\s+$"; "")) | map(select(length > 0))'
    return 0
  fi

  local IFS=',' name json="[" first=true
  set -f
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
  set +f
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

build_bulk_role_descriptors() {
  local pattern="$1" names
  names="$(build_index_names_json "$pattern")"
  cat <<EOF
{
  "app-bulk-role": {
    "cluster": ["monitor"],
    "indices": [
      {
        "names": ${names},
        "privileges": ["read", "write", "create_index", "delete_index", "view_index_metadata", "maintenance", "manage"]
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

extract_encoded_key() {
  local body="$1"
  if command -v jq >/dev/null 2>&1; then
    jq -r '.encoded // empty' <<< "$body"
  else
    sed -n 's/.*"encoded"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' <<< "$body"
  fi
}

save_api_key() {
  local var_name="$1" api_key="$2" label="$3"
  set_env_var "$var_name" "$api_key"
  if [[ "$DRY_RUN" == false ]]; then
    log_success "${CMD}${var_name}${RESET} (${label}) salvo em ${ENV_FILE}."
  fi
}

# ---------------------------------------------------------------------------
# Transporte: host (dev)
# ---------------------------------------------------------------------------

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

request_api_key() {
  local url="$1" user="$2" pass="$3" payload="$4"

  curl_with_basic_auth "$user" "$pass" \
    --request POST "${url}/_security/api_key" \
    --header 'Content-Type: application/json' \
    --data "$payload" \
    --write-out '\n%{http_code}'
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
  local url="$1" user pass api_role_descriptors bulk_role_descriptors

  print_step "Gerenciamento das API Keys do Elasticsearch"
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

  if [[ -n "$BULK_ROLE_DESCRIPTORS_FILE" ]]; then
    [[ -f "$BULK_ROLE_DESCRIPTORS_FILE" ]] || die "Arquivo de role descriptors do bulk não encontrado: ${BULK_ROLE_DESCRIPTORS_FILE}"
    bulk_role_descriptors="$(cat "$BULK_ROLE_DESCRIPTORS_FILE")"
    log_info "Aplicando privilégios restritos do bulk do arquivo: ${BULK_ROLE_DESCRIPTORS_FILE}"
  else
    bulk_role_descriptors="$(build_bulk_role_descriptors "$BULK_INDEX_PATTERN")"
    log_info "Chave do bulk limitada ao pattern: ${BULK_INDEX_PATTERN}"
  fi

  setup_single_api_key "API Key (somente leitura)" "$API_KEY_NAME" "$VAR_APIKEY" "$api_role_descriptors" "$url" "$user" "$pass"
  setup_single_api_key "API Key do bulk (leitura/escrita)" "$BULK_API_KEY_NAME" "$VAR_BULK_APIKEY" "$bulk_role_descriptors" "$url" "$user" "$pass"
}

# ---------------------------------------------------------------------------
# Transporte: container (prod, sem porta publicada no host)
# ---------------------------------------------------------------------------

# Executa um curl DENTRO do container do Elasticsearch. O ES escuta em
# localhost:9200 dentro do container e não expõe porta no host em produção.
es_exec() {
  local container="$1" user="$2" pass="$3"
  shift 3
  require_engine
  "$CONTAINER_ENGINE" exec "$container" curl -s -u "${user}:${pass}" "$@"
}

# Como es_exec, mas autentica com uma API key (Authorization: ApiKey) em vez
# de basic auth. Usado para validar chaves existentes.
es_exec_api_key() {
  local container="$1" key="$2"
  shift 2
  require_engine
  "$CONTAINER_ENGINE" exec "$container" curl -s -H "Authorization: ApiKey ${key}" "$@"
}

check_cluster_health_in_container() {
  local container="$1" user="$2" pass="$3" response status

  response="$(es_exec "$container" "$user" "$pass" \
    "http://localhost:9200/_cluster/health" 2>/dev/null || true)"

  if command -v jq >/dev/null 2>&1; then
    status="$(jq -r '.status // empty' <<< "$response")"
  else
    status="$(sed -n 's/.*"status"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' <<< "$response")"
  fi

  [[ "$status" == "green" || "$status" == "yellow" ]]
}

wait_for_elasticsearch_in_container() {
  local container="$1" user="$2" pass="$3" elapsed=0 interval=3

  log_info "Aguardando o Elasticsearch (${CMD}${container}${RESET}) ficar pronto..."

  while true; do
    if check_cluster_health_in_container "$container" "$user" "$pass"; then
      log_success "Elasticsearch online e com cluster saudável."
      return 0
    fi

    if (( WAIT_SECONDS > 0 && elapsed >= WAIT_SECONDS )); then
      die "Elasticsearch (${container}) não respondeu adequadamente dentro de ${WAIT_SECONDS}s. Verifique as credenciais em ${ENV_FILE} e os logs do container."
    fi

    log_warn "Elasticsearch indisponível ou cluster em estado degradado/red (${elapsed}s). Aguardando..."
    sleep "$interval"
    elapsed=$(( elapsed + interval ))
  done
}

validate_existing_api_key_in_container() {
  local container="$1" var_name="$2" label="$3" current_key response

  current_key="$(get_env_var "$var_name")"
  is_blank "$current_key" && return 1

  log_info "Validando ${label} existente no ${ENV_FILE}..."

  response="$(es_exec_api_key "$container" "$current_key" \
    "http://localhost:9200/_security/_authenticate" 2>/dev/null || true)"

  if [[ "$response" == *'"username"'* ]]; then
    log_success "A ${label} atual já é válida. Nenhuma ação necessária."
    return 0
  fi

  log_warn "A ${label} atual é inválida, expirou ou foi revogada. Uma nova será gerada."
  return 1
}

delete_api_keys_by_name_in_container() {
  local container="$1" user="$2" pass="$3" key_name="$4" response

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Revogaria as chaves com o nome ${CMD}${key_name}${RESET}."
    return 0
  fi

  response="$(es_exec "$container" "$user" "$pass" \
    -X DELETE "http://localhost:9200/_security/api_key" \
    -H "Content-Type: application/json" \
    --data "{\"name\":\"$(escape_quoted "$key_name")\"}" 2>/dev/null || true)"

  if [[ "$response" == *'"found"'* ]]; then
    log_success "Chaves antigas '${key_name}' revogadas."
  else
    log_warn "Não foi possível revogar as chaves '${key_name}'. Seguindo para a criação."
  fi
}

request_api_key_in_container() {
  local container="$1" user="$2" pass="$3" payload="$4" response http_code

  if [[ "$DRY_RUN" == true ]]; then
    printf '%b\n' "  ${MUTED}•${RESET} [DRY-RUN] Requisitaria a API Key dentro do container ${container}." >&2
    printf 'HTTP 200\n{"encoded":"DRY_RUN_MOCK_API_KEY"}'
    return 0
  fi

  response="$(es_exec "$container" "$user" "$pass" \
    -X POST "http://localhost:9200/_security/api_key" \
    -H "Content-Type: application/json" \
    --data "$payload" \
    --write-out '\n%{http_code}' 2>/dev/null || true)"

  http_code="$(tail -n1 <<< "$response")"
  case "$http_code" in
    200|201) ;;
    401) die "Credenciais inválidas (HTTP 401) ao gerar API key dentro do container ${container}. A senha em ${ENV_FILE} não confere com a do volume do Elasticsearch." ;;
    *)   die "Erro ao gerar API key dentro do container (HTTP ${http_code}): $(sed '$d' <<< "$response")" ;;
  esac

  printf '%s' "$(sed '$d' <<< "$response")"
}

setup_single_api_key_in_container() {
  local label="$1" key_name="$2" var_name="$3" role_descriptors="$4"
  local container="$5" user="$6" pass="$7"
  local api_key

  if [[ "$REUSE_VALID_KEYS" == true ]] && validate_existing_api_key_in_container "$container" "$var_name" "$label"; then
    return 0
  fi

  delete_api_keys_by_name_in_container "$container" "$user" "$pass" "$key_name"

  log_info "Gerando ${label} (${CMD}${key_name}${RESET})..."
  api_key="$(request_api_key_in_container "$container" "$user" "$pass" "$(build_api_key_payload "$key_name" "$role_descriptors")")"
  encoded="$(extract_encoded_key "$api_key")"
  [[ -n "$encoded" ]] || die "Resposta sem o campo 'encoded': ${api_key}"
  log_success "${label} gerada com sucesso."

  save_api_key "$var_name" "$encoded" "$label"
}

setup_api_keys_in_container() {
  local container="$1" user pass api_role_descriptors bulk_role_descriptors

  print_step "Gerenciamento das API Keys (dentro do container ${container})"
  user="$(get_env_var "$VAR_USER")"
  pass="$(get_env_var "$VAR_PASS")"

  if [[ -n "$API_ROLE_DESCRIPTORS_FILE" ]]; then
    [[ -f "$API_ROLE_DESCRIPTORS_FILE" ]] || die "Arquivo de role descriptors da API não encontrado: ${API_ROLE_DESCRIPTORS_FILE}"
    api_role_descriptors="$(cat "$API_ROLE_DESCRIPTORS_FILE")"
    log_info "Aplicando privilégios restritos da API do arquivo: ${API_ROLE_DESCRIPTORS_FILE}"
  else
    api_role_descriptors="$(build_read_role_descriptors "$API_INDEX_PATTERN")"
    log_info "Chave de leitura limitada ao pattern: ${API_INDEX_PATTERN}"
  fi

  if [[ -n "$BULK_ROLE_DESCRIPTORS_FILE" ]]; then
    [[ -f "$BULK_ROLE_DESCRIPTORS_FILE" ]] || die "Arquivo de role descriptors do bulk não encontrado: ${BULK_ROLE_DESCRIPTORS_FILE}"
    bulk_role_descriptors="$(cat "$BULK_ROLE_DESCRIPTORS_FILE")"
    log_info "Aplicando privilégios restritos do bulk do arquivo: ${BULK_ROLE_DESCRIPTORS_FILE}"
  else
    bulk_role_descriptors="$(build_bulk_role_descriptors "$BULK_INDEX_PATTERN")"
    log_info "Chave do bulk limitada ao pattern: ${BULK_INDEX_PATTERN}"
  fi

  setup_single_api_key_in_container "API Key (somente leitura)" "$API_KEY_NAME" "$VAR_APIKEY" "$api_role_descriptors" "$container" "$user" "$pass"
  setup_single_api_key_in_container "API Key do bulk (leitura/escrita)" "$BULK_API_KEY_NAME" "$VAR_BULK_APIKEY" "$bulk_role_descriptors" "$container" "$user" "$pass"
}
