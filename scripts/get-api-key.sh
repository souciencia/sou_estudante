#!/usr/bin/env bash

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Erro: Arquivo $ENV_FILE não encontrado!"
    exit 1
fi

# Carrega as variáveis do .env ignorando comentários
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Define usuário padrão como elastic caso não esteja no .env
USER="${ELASTIC_USER:-elastic}"
PASSWORD="${ELASTIC_PASSWORD:-$ELASTICSEARCH_PASSWORD}"
URL="${ELASTICSEARCH_URL:-http://localhost:9200}"

if [ -z "$PASSWORD" ]; then
    echo "Erro: Senha do Elasticsearch não encontrada no $ENV_FILE."
    exit 1
fi

echo "Obtendo API Key do Elasticsearch..."

# Faz a chamada para a API do Elasticsearch
RESPONSE=$(curl -s -u "$USER:$PASSWORD" -X POST "$URL/_security/api_key" \
     -H "Content-Type: application/json" \
     -d '{"name": "my_api"}')


API_KEY=$(echo "$RESPONSE" | grep -o '"encoded":"[^"]*' | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
    echo "Erro ao gerar a API Key. Resposta do Elasticsearch:"
    echo "$RESPONSE"
    exit 1
fi

echo "API Key gerada com sucesso!"

if grep -q "^ELASTICSEARCH_API_KEY=" "$ENV_FILE"; then
    sed -i.bak "s|^ELASTICSEARCH_API_KEY=.*|ELASTICSEARCH_API_KEY=$API_KEY|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
else
    echo "" >> "$ENV_FILE"
    echo "ELASTICSEARCH_API_KEY=$API_KEY" >> "$ENV_FILE"
fi

echo "Arquivo $ENV_FILE atualizado."

echo "Reiniciando o container se_api..."
docker compose restart se_api

echo "Processo concluído com sucesso!"