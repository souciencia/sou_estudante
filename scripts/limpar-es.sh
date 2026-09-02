#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Erro: Arquivo $ENV_FILE não encontrado!"
    exit 1
fi

# Carrega as variáveis do .env ignorando comentários
set -a
# shellcheck disable=SC1090
source <(grep -v '^#' "$ENV_FILE")
set +a

USERNAME="${ELASTICSEARCH_USERNAME:-elastic}"
PASSWORD="${ELASTIC_PASSWORD:-}"
URL=http://localhost:9200"

if [ -z "$PASSWORD" ]; then
    echo "Erro: ELASTIC_PASSWORD não encontrado no $ENV_FILE."
    exit 1
fi

echo "Limpando o Elasticsearch em $URL..."
echo "Mantendo os índices de sistema (.security, .kibana, etc.) e as API Keys."

# Lista os índices excluindo os índices de sistema (prefixo ".")
INDICES=$(curl -s -u "$USERNAME:$PASSWORD" "$URL/_cat/indices?h=index" | grep -v '^\.' || true)

if [ -z "$INDICES" ]; then
    echo "Nenhum índice a remover."
else
    for index in $INDICES; do
        echo "Removendo índice: $index"
        curl -s -u "$USERNAME:$PASSWORD" -X DELETE "$URL/$index?expand_wildcards=open,closed" || true
        echo
    done
fi

# Remove aliases que apontam para índices que não pertencem ao sistema
ALIASES=$(curl -s -u "$USERNAME:$PASSWORD" "$URL/_cat/aliases?h=alias,index" | awk '$2 !~ /^\./ {print $1, $2}' || true)

if [ -n "$ALIASES" ]; then
    while read -r alias index; do
        echo "Removendo alias: $alias (índice: $index)"
        curl -s -u "$USERNAME:$PASSWORD" -X DELETE "$URL/_alias/$alias" || true
        echo
    done <<< "$ALIASES"
fi

echo "Limpeza concluída!"
