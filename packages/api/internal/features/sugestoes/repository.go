package sugestoes

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"
)

// Repository define contrato de acesso às sugestões de cursos
type Repository interface {
	BuscarSugestoes(ctx context.Context, termo string, limit int) ([]string, error)
}

// ElasticsearchRepository implementa Repository usando Elasticsearch
type ElasticsearchRepository struct {
	client *elasticsearch.Client
	index  string
}

// NewElasticsearchRepository cria nova instância do repository
func NewElasticsearchRepository(client *elasticsearch.Client, index string) Repository {
	return &ElasticsearchRepository{
		client: client,
		index:  index,
	}
}

// sugestaoHit representa um documento do índice de dicionário de cursos
type sugestaoHit struct {
	Source struct {
		NoCurso string `json:"no_curso"`
	} `json:"_source"`
}

// sugestoesESResponse é a resposta mínima decodificada do Elasticsearch
type sugestoesESResponse struct {
	Hits struct {
		Hits []sugestaoHit `json:"hits"`
	} `json:"hits"`
}

// BuscarSugestoes consulta nomes de cursos no índice de dicionário usando prefixo
func (r *ElasticsearchRepository) BuscarSugestoes(ctx context.Context, termo string, limit int) ([]string, error) {
	queryBody := map[string]interface{}{
		"size": limit,
		"query": map[string]interface{}{
			"multi_match": map[string]interface{}{
				"query":  termo,
				"type":   "bool_prefix",
				"fields": []string{"no_curso"},
			},
		},
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(queryBody); err != nil {
		return nil, fmt.Errorf("erro ao serializar query de sugestões: %w", err)
	}

	res, err := r.client.Search(
		r.client.Search.WithContext(ctx),
		r.client.Search.WithIndex(r.index),
		r.client.Search.WithBody(&buf),
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao consultar sugestões no elasticsearch: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("erro do elasticsearch ao buscar sugestões: %s", res.String())
	}

	var parsed sugestoesESResponse
	if err := json.NewDecoder(res.Body).Decode(&parsed); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta de sugestões: %w", err)
	}

	// Garantir unicidade e remover entradas vazias
	seen := make(map[string]struct{}, len(parsed.Hits.Hits))
	sugestoes := make([]string, 0, len(parsed.Hits.Hits))
	for _, hit := range parsed.Hits.Hits {
		nome := strings.TrimSpace(hit.Source.NoCurso)
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
