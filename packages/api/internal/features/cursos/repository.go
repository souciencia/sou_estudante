package cursos

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"
)

// Repository define contrato de acesso a cursos
type Repository interface {
	Search(ctx context.Context, query string, page, limit int) (*SearchResult, error)
}

// ElasticsearchRepository implementa Repository usando Elasticsearch
type ElasticsearchRepository struct {
	client *elasticsearch.Client
	index  string
}

// SearchResult encapsula resposta do Elasticsearch
type SearchResult struct {
	Total int
	Hits  []map[string]interface{}
}

// NewElasticsearchRepository cria nova instância do repository
func NewElasticsearchRepository(client *elasticsearch.Client) Repository {
	return &ElasticsearchRepository{
		client: client,
		index:  "cursos", // Índice de cursos
	}
}

// Search executa busca no Elasticsearch
func (r *ElasticsearchRepository) Search(
	ctx context.Context,
	query string,
	page, limit int,
) (*SearchResult, error) {
	// 1. Calcular offset para paginação
	from := (page - 1) * limit

	// 2. Construir query DSL com busca em múltiplos campos
	esQuery := map[string]interface{}{
		"query": map[string]interface{}{
			"multi_match": map[string]interface{}{
				"query": query,
				"fields": []string{
					"curso.no_curso^3",                // Peso maior no nome do curso
					"curso.cine.no_cine_rotulo^2",     // Peso no CINE
					"localizacao.no_municipio",        // Município
					"localizacao.sg_uf",               // UF
					"localizacao.no_regiao",           // Região
				},
				"type":      "best_fields",
				"fuzziness": "AUTO", // Tolera erros de digitação
			},
		},
		"size": limit,
		"from": from,
		"sort": []map[string]interface{}{
			{"_score": "desc"}, // Relevância primeiro
		},
		// Retorna todos os campos (sem filtro _source)
	}

	// 3. Serializar para JSON
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(esQuery); err != nil {
		return nil, fmt.Errorf("erro ao montar query: %w", err)
	}

	// 4. Executar search no Elasticsearch
	res, err := r.client.Search(
		r.client.Search.WithContext(ctx),
		r.client.Search.WithIndex(r.index),
		r.client.Search.WithBody(&buf),
		r.client.Search.WithTrackTotalHits(true),
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao executar search: %w", err)
	}
	defer res.Body.Close()

	// 5. Verificar erro HTTP
	if res.IsError() {
		var errResp map[string]interface{}
		json.NewDecoder(res.Body).Decode(&errResp)
		return nil, fmt.Errorf("erro ES [%s]: %v", res.Status(), errResp)
	}

	// 6. Parse da resposta
	var esResp struct {
		Hits struct {
			Total struct {
				Value int `json:"value"`
			} `json:"total"`
			Hits []struct {
				ID     string                 `json:"_id"`
				Source map[string]interface{} `json:"_source"`
			} `json:"hits"`
		} `json:"hits"`
	}

	if err := json.NewDecoder(res.Body).Decode(&esResp); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta: %w", err)
	}

	// 7. Montar resultado
	hits := make([]map[string]interface{}, 0, len(esResp.Hits.Hits))
	for _, hit := range esResp.Hits.Hits {
		// Adicionar _id ao _source
		hit.Source["_id"] = hit.ID
		hits = append(hits, hit.Source)
	}

	return &SearchResult{
		Total: esResp.Hits.Total.Value,
		Hits:  hits,
	}, nil
}
