# Rotina de produção: publica no servidor via docker-compose.prod.yml.
# Como o ES não publica porta no host em produção, as API keys são geradas
# DENTRO do container (podman exec). Etapas: valida o .env, detecta o compose,
# sobe o ES e aguarda, gera as keys, constrói as imagens, sobe os serviços,
# remove imagens órfãs e verifica a saúde (ES, API, front).

validate_env_essentials() {
  local var value missing=0

  for var in ELASTIC_PASSWORD SE_HOST SE_AUTH_USER SE_AUTH_HASH; do
    value="$(get_env_var "$var")"
    if is_blank "$value"; then
      printf 'ERRO: variável %s vazia ou ausente no .env\n' "$var" >&2
      missing=1
    fi
  done
  [ "$missing" -eq 0 ] || exit 1
}

compose() {
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --env-file .env "$@"
}

# Aguarda até ~60 s (30 tentativas, 2 s). Os códigos aceitos vão em $3.
wait_http() {
  local name="$1" url="$2" accepted="$3" code
  for _ in $(seq 1 30); do
    code="$(curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)"
    if [[ " $accepted " == *" $code "* ]]; then
      echo "$name OK (HTTP $code)"
      return 0
    fi
    sleep 2
  done
  die "$name não respondeu em $url"
}

run_prod() {
  [ -f .env ] || die ".env não encontrado em $ROOT (crie a partir de .env.example)"

  print_step "Validando variáveis essenciais do .env"
  validate_env_essentials

  print_step "Detectando o comando de compose"
  require_compose
  echo "Usando: ${COMPOSE_CMD[*]}"

  print_step "Subindo o Elasticsearch (para gerar as API keys)"
  compose up -d se_es01

  local es_container user pass
  es_container="$(resolve_es_container)"
  user="$(get_env_var "$VAR_USER")"
  pass="$(get_env_var "$VAR_PASS")"

  if [[ "$DRY_RUN" == false ]]; then
    wait_for_elasticsearch_in_container "$es_container" "$user" "$pass"
  fi

  setup_api_keys_in_container "$es_container"

  print_step "Construindo imagens de produção (IMAGE_TAG=$IMAGE_TAG)"
  compose build --pull

  print_step "Subindo serviços"
  compose up -d --remove-orphans

  print_step "Removendo imagens órfãs"
  case "${COMPOSE_CMD[0]}" in
    podman*) podman image prune -f >/dev/null 2>&1 || true ;;
    docker*) docker image prune -f >/dev/null 2>&1 || true ;;
  esac

  print_step "Verificando a saúde dos serviços"
  # O Elasticsearch não publica porta no host: já foi validado acima, dentro do
  # container (wait_for_elasticsearch_in_container). A API confirma a conexão
  # com o ES via /readyz.
  wait_http "API" "http://localhost:8080/healthz" "200"
  wait_http "API (ES)" "http://localhost:8080/readyz" "200"
  wait_http "Frontend" "http://localhost:3000/" "200"

  print_step "Status dos containers"
  compose ps

  print_step "Deploy concluído com sucesso"
}
