# Helpers de curl para falar com o Elasticsearch, compartilhados pelos scripts.
# Requer as variáveis globais CURL_TIMEOUT e CURL_INSECURE definidas.

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
