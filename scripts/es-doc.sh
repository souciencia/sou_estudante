#!/usr/bin/env bash
# Busca um documento do Elasticsearch (para inspeção manual em dev).
#
# Uso:
#   scripts/es-doc.sh cursos          # documento aleatório do índice de cursos
#   scripts/es-doc.sh ies             # documento aleatório do índice de IES
#   scripts/es-doc.sh cursos 1234     # documento com _id 1234
#
# A API key (somente leitura) vem de ELASTICSEARCH_APIKEY no .env da raiz.
# Variáveis opcionais: ES_HOST_URL (padrão http://localhost:9200), ENV_FILE.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS_DIR="$ROOT/scripts"

# Variáveis exigidas pelas libs antes de carregá-las.
ENV_FILE="${ENV_FILE:-$ROOT/.env}"
ENV_EXAMPLE_FILE="$ROOT/.env.example"
DRY_RUN=false

source "$SCRIPTS_DIR/lib/log.sh"
source "$SCRIPTS_DIR/lib/util.sh"
source "$SCRIPTS_DIR/lib/env.sh"

ES_HOST_URL="${ES_HOST_URL:-http://localhost:9200}"

[[ $# -ge 1 && $# -le 2 ]] || die "uso: $0 <cursos|ies> [id]"
[[ -f "$ENV_FILE" ]] || die "$ENV_FILE não encontrado (rode ./setup.sh)"
require_command curl

case "$1" in
  cursos) index="$(get_env_var CURSOS_INDEX_NAME)"; index="${index:-cursos}-latest" ;;
  ies)    index="$(get_env_var IES_INDEX_NAME)"; index="${index:-ies}-latest" ;;
  *)      die "índice inválido: $1 (use cursos ou ies)" ;;
esac

api_key="$(get_env_var ELASTICSEARCH_APIKEY)"
[[ -n "$api_key" ]] || die "ELASTICSEARCH_APIKEY vazia em $ENV_FILE"

# A chave vai por arquivo de config do curl para não aparecer em `ps`.
curl_config="$(mktemp)"
trap 'rm -f "$curl_config"' EXIT
chmod 600 "$curl_config"
printf 'header = "Authorization: ApiKey %s"\n' "$api_key" > "$curl_config"

if [[ $# -eq 2 ]]; then
  [[ "$2" =~ ^[0-9]+$ ]] || die "id deve ser numérico: $2"
  response="$(curl -fsS -K "$curl_config" "$ES_HOST_URL/$index/_doc/$2")"
else
  response="$(curl -fsS -K "$curl_config" -H 'Content-Type: application/json' \
    -d '{"size":1,"query":{"function_score":{"random_score":{}}}}' \
    "$ES_HOST_URL/$index/_search")"
fi

if command -v jq >/dev/null; then
  printf '%s\n' "$response" | jq .
else
  printf '%s\n' "$response"
fi
