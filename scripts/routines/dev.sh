# Rotina de desenvolvimento (local): constrói as imagens, sobe o ES, gera as
# API keys via host (localhost:9200), roda o bulk, sobe API/front e abre o
# navegador.

build_images() {
  print_step "3. Build das imagens (API, bulk e front)"

  if [[ "$SKIP_BUILD" == true ]]; then
    log_info "Etapa ignorada (--skip-build)."
    return 0
  fi

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Executaria: $(compose_display) --profile ${BULK_PROFILE} build"
    return 0
  fi

  require_compose
  log_info "Construindo as imagens..."
  if "${COMPOSE_CMD[@]}" --profile "$BULK_PROFILE" build; then
    log_success "Imagens construídas com sucesso."
  else
    die "Falha ao construir as imagens. Verifique o log acima."
  fi
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

start_bulk() {
  print_step "6. Container de bulking (${BULK_SERVICE})"

  if [[ "$SKIP_BULK" == true ]]; then
    log_info "Etapa ignorada (--skip-bulk)."
    return 0
  fi

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Executaria: $(compose_display) --profile ${BULK_PROFILE} run --rm --no-deps ${BULK_SERVICE}"
    return 0
  fi

  local data_file source
  source="$(get_env_var "CURSOS_JSON_FILE_PATH")"
  if is_blank "$source"; then
    data_file="./data/dados_cursos.json"
  else
    data_file="./data/${source##*/}"
  fi
  if [[ ! -f "$data_file" ]]; then
    log_warn "Arquivo de dados não encontrado em ${data_file}; bulking ignorado."
    log_info "Coloque o JSON da equipe de dados nesse caminho e rode novamente."
    return 0
  fi

  require_compose

  log_info "Executando o job de bulking..."
  if "${COMPOSE_CMD[@]}" --profile "$BULK_PROFILE" run --rm --no-deps "$BULK_SERVICE"; then
    log_success "Container de bulking executado com sucesso."
  else
    die "Falha ao executar o container de bulking. Verifique se a imagem foi construída: $(compose_display) --profile ${BULK_PROFILE} build"
  fi
}

check_indices() {
  local url="$1" key response http_code body names

  print_step "7. Índices existentes no Elasticsearch"
  key="$(get_env_var "$VAR_BULK_APIKEY")"

  if is_blank "$key"; then
    log_warn "API key do bulk indisponível; pulando a verificação de índices."
    return 0
  fi

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Consultaria ${url}/_cat/indices com a chave do bulk."
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

start_services() {
  print_step "8. API e front (se_api, se_front)"

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Executaria: $(compose_display) up -d se_api se_front"
    return 0
  fi

  require_compose
  log_info "Subindo os containers da API e do front..."
  if "${COMPOSE_CMD[@]}" up -d se_api se_front; then
    log_success "se_api e se_front em execução."
  else
    die "Falha ao subir se_api e se_front. Verifique o log acima."
  fi
}

open_front() {
  print_step "9. Página do front"

  local opener=""
  if command -v xdg-open >/dev/null 2>&1; then
    opener="xdg-open"
  elif command -v open >/dev/null 2>&1; then
    opener="open"
  elif command -v wslview >/dev/null 2>&1; then
    opener="wslview"
  fi

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY-RUN] Abriria ${CMD}${FRONT_URL}${RESET} no navegador."
    return 0
  fi

  if [[ -n "$opener" ]]; then
    "$opener" "$FRONT_URL" >/dev/null 2>&1 || true
    log_success "Front aberto no navegador em ${CMD}${FRONT_URL}${RESET}."
  else
    log_info "Abra o front em ${CMD}${FRONT_URL}${RESET} (nenhum navegador encontrado no host)."
  fi
}

print_summary() {
  local compose_cmd
  compose_cmd="$(compose_display)"

  echo
  print_line
  printf '%b\n' "${BOLD}${SUCCESS}  Setup concluído!${RESET}"
  print_line
  log_success "API Keys prontas e salvas em ${CMD}${ENV_FILE}${RESET} (permissões 600)."
  if [[ "$SKIP_BULK" == true ]]; then
    log_warn "Container de bulking não foi executado (--skip-bulk)."
  else
    log_success "Container de bulking (${BULK_SERVICE}) executado com sucesso."
  fi
  log_success "API e front em execução: ${CMD}http://localhost:8080${RESET} e ${CMD}${FRONT_URL}${RESET}."
  echo
  log_info "Próximos passos — reindexação de dados pelo container de bulking:"
  printf '      %s\n' "${compose_cmd} --profile ${BULK_PROFILE} run --rm --no-deps ${BULK_SERVICE}"
  echo
  log_info "Para parar os serviços: ${CMD}${compose_cmd} down${RESET}"
  echo
}

run_dev() {
  local url es_container

  url="$(resolve_host_url)"
  es_container="$(resolve_es_container)"

  build_images

  print_step "4. Elasticsearch"
  ensure_elasticsearch_up "$es_container"
  if [[ "$DRY_RUN" == false ]]; then
    wait_for_elasticsearch "$url" "$(get_env_var "$VAR_USER")" "$(get_env_var "$VAR_PASS")"
  fi

  setup_api_keys "$url"
  start_bulk
  check_indices "$url"
  start_services
  open_front

  print_summary
}
