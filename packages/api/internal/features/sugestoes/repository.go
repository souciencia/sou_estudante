package sugestoes

import (
	"context"
	"fmt"
	"strings"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/elasticsearch"
)

// Repository define contrato de acesso às sugestões de cursos
type Repository interface {
	BuscarSugestoes(ctx context.Context, termo string, limit int) ([]string, error)
}

// ElasticsearchRepository implementa Repository usando Elasticsearch
type ElasticsearchRepository struct {
	client *es.Client
	index  string
	field  string
}

// NewElasticsearchRepository cria nova instância do repository.
// index é o índice de dicionário e field é o campo de texto do documento
// (ex.: "no_curso" para dicionario_cursos, "no_ies" para dicionario_ies).
func NewElasticsearchRepository(client *es.Client, index, field string) Repository {
	return &ElasticsearchRepository{
		client: client,
		index:  index,
		field:  field,
	}
}

// BuscarSugestoes consulta nomes no índice de dicionário usando prefixo
func (r *ElasticsearchRepository) BuscarSugestoes(ctx context.Context, termo string, limit int) ([]string, error) {
	queryBody := map[string]interface{}{
		"size": limit,
		"query": map[string]interface{}{
			"multi_match": map[string]interface{}{
				"query":  termo,
				"type":   "bool_prefix",
				"fields": []string{r.field},
			},
		},
	}

	resp, err := elasticsearch.ExecuteSearch[map[string]string](ctx, r.client, r.index, queryBody)
	if err != nil {
		return nil, fmt.Errorf("erro ao consultar sugestões no elasticsearch: %w", err)
	}

	// Garantir unicidade e remover entradas vazias
	seen := make(map[string]struct{}, len(resp.Hits))
	sugestoes := make([]string, 0, len(resp.Hits))
	for _, hit := range resp.Hits {
		nome := strings.TrimSpace(hit[r.field])
		if nome == "" {
			continue
		}
		if _, ok := seen[nome]; ok {
			continue
		}
		seen[nome] = struct{}{}
		sugestoes = append(sugestoes, nome)
	}
	return sugestoes, nil
}
