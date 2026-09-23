package ies

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/shared"
)

// ErrNotFound indica que a IES solicitada não existe no índice.
var ErrNotFound = errors.New("ies não encontrada")

// indexName é o índice estático de IES populado pelo bulker.
const indexName = "ies"

// Repository define o contrato de acesso às IES.
type Repository interface {
	Search(ctx context.Context, query string, filters SearchFilterParams, page, limit int) (*SearchResult, error)
	GetByID(ctx context.Context, coIES string) (*IES, error)
}

// ElasticsearchRepository implementa Repository usando Elasticsearch.
type ElasticsearchRepository struct {
	client *elasticsearch.Client
	index  string
}

// SearchResult encapsula a resposta do Elasticsearch.
type SearchResult struct {
	Total        int
	Hits         []map[string]interface{}
	Aggregations *SearchAggregations
}

// NewElasticsearchRepository cria uma nova instância do repository.
func NewElasticsearchRepository(client *elasticsearch.Client) Repository {
	return &ElasticsearchRepository{
		client: client,
		index:  indexName,
	}
}

// buildQuery escolhe a consulta textual: match_all quando não há termo.
func buildQuery(query string) map[string]interface{} {
	if strings.TrimSpace(query) == "" {
		return map[string]interface{}{"match_all": map[string]interface{}{}}
	}
	return buildTextQuery(query)
}

// buildTextQuery monta a busca textual por nome e sigla da IES. Usa operator
// "and" para exigir todos os termos digitados e evitar correspondências soltas.
func buildTextQuery(query string) map[string]interface{} {
	return map[string]interface{}{
		"multi_match": map[string]interface{}{
			"query":     query,
			"fields":    []string{"no_ies^3", "sg_ies^2"},
			"type":      "best_fields",
			"operator":  "and",
			"fuzziness": "AUTO",
		},
	}
}

// categoriaFilter monta a cláusula de filtro por categoria administrativa.
// Os campos do índice ies já são keyword, portanto não levam sufixo ".keyword".
func categoriaFilter(categoria string) map[string]interface{} {
	terms := shared.CategoriaTerms(categoria)
	if len(terms) == 0 {
		return nil
	}
	return map[string]interface{}{
		"terms": map[string]interface{}{
			"categoria_administrativa": terms,
		},
	}
}

// buildFilterClauses monta as cláusulas de filtro cumulativas.
func buildFilterClauses(filters SearchFilterParams) []map[string]interface{} {
	clauses := []map[string]interface{}{}

	if len(filters.UF) > 0 {
		ufs := make([]string, len(filters.UF))
		for i, uf := range filters.UF {
			ufs[i] = strings.ToUpper(uf)
		}
		clauses = append(clauses, map[string]interface{}{
			"terms": map[string]interface{}{"uf": ufs},
		})
	}

	if len(filters.Regiao) > 0 {
		clauses = append(clauses, map[string]interface{}{
			"terms": map[string]interface{}{"regiao": filters.Regiao},
		})
	}

	if len(filters.Categoria) > 0 {
		should := []map[string]interface{}{}
		for _, cat := range filters.Categoria {
			if clause := categoriaFilter(cat); clause != nil {
				should = append(should, clause)
			}
		}
		if len(should) > 0 {
			clauses = append(clauses, map[string]interface{}{
				"bool": map[string]interface{}{
					"should":               should,
					"minimum_should_match": 1,
				},
			})
		}
	}

	if len(filters.Organizacao) > 0 {
		clauses = append(clauses, map[string]interface{}{
			"terms": map[string]interface{}{"organizacao_academica": filters.Organizacao},
		})
	}

	return clauses
}

// buildSortClauses define a ordenação: relevância (score) ou alfabética (padrão).
func buildSortClauses(sort string) []map[string]interface{} {
	switch sort {
	case "relevancia", "_score":
		return []map[string]interface{}{
			{"_score": "desc"},
		}
	default:
		return []map[string]interface{}{
			{"no_ies.keyword": map[string]interface{}{"order": "asc"}},
		}
	}
}

// buildAggregations monta as agregações usadas pelos filtros da UI.
func buildAggregations() map[string]interface{} {
	return map[string]interface{}{
		"ufs": map[string]interface{}{
			"terms": map[string]interface{}{"field": "uf", "size": 30},
		},
		"regioes": map[string]interface{}{
			"terms": map[string]interface{}{"field": "regiao", "size": 10},
		},
		"organizacoes": map[string]interface{}{
			"terms": map[string]interface{}{"field": "organizacao_academica", "size": 20},
		},
		"categorias": map[string]interface{}{
			"filters": map[string]interface{}{
				"filters": map[string]interface{}{
					"Privada":   categoriaFilter("privada"),
					"Federal":   categoriaFilter("federal"),
					"Estadual":  categoriaFilter("estadual"),
					"Municipal": categoriaFilter("municipal"),
				},
			},
		},
	}
}

// parseAggregations converte o bloco de agregações do ES em buckets.
func parseAggregations(raw map[string]json.RawMessage) *SearchAggregations {
	if len(raw) == 0 {
		return nil
	}

	parseBuckets := func(name string) []AggregationBucket {
		payload, ok := raw[name]
		if !ok {
			return nil
		}

		// 1. Tentar array buckets (terms aggregation).
		var arrayAgg struct {
			Buckets []struct {
				Key      interface{} `json:"key"`
				DocCount int         `json:"doc_count"`
			} `json:"buckets"`
		}
		if err := json.Unmarshal(payload, &arrayAgg); err == nil && len(arrayAgg.Buckets) > 0 {
			buckets := make([]AggregationBucket, 0, len(arrayAgg.Buckets))
			for _, b := range arrayAgg.Buckets {
				buckets = append(buckets, AggregationBucket{
					Key:   fmt.Sprintf("%v", b.Key),
					Count: b.DocCount,
				})
			}
			return buckets
		}

		// 2. Tentar map buckets (filters aggregation).
		var mapAgg struct {
			Buckets map[string]struct {
				DocCount int `json:"doc_count"`
			} `json:"buckets"`
		}
		if err := json.Unmarshal(payload, &mapAgg); err == nil && len(mapAgg.Buckets) > 0 {
			buckets := make([]AggregationBucket, 0, len(mapAgg.Buckets))
			for key, b := range mapAgg.Buckets {
				buckets = append(buckets, AggregationBucket{
					Key:   key,
					Count: b.DocCount,
				})
			}
			return buckets
		}

		return nil
	}

	return &SearchAggregations{
		UFs:          parseBuckets("ufs"),
		Regioes:      parseBuckets("regioes"),
		Categorias:   parseBuckets("categorias"),
		Organizacoes: parseBuckets("organizacoes"),
	}
}

// Search executa a busca de IES com filtros cumulativos, ordenação e agregações.
func (r *ElasticsearchRepository) Search(
	ctx context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*SearchResult, error) {
	from := (page - 1) * limit

	boolQuery := map[string]interface{}{
		"must": buildQuery(query),
	}
	if filterClauses := buildFilterClauses(filters); len(filterClauses) > 0 {
		boolQuery["filter"] = filterClauses
	}

	esQuery := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": boolQuery,
		},
		"size": limit,
		"from": from,
		"sort": buildSortClauses(filters.Sort),
		"aggs": buildAggregations(),
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(esQuery); err != nil {
		return nil, fmt.Errorf("erro ao montar query: %w", err)
	}

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

	if res.IsError() {
		var errResp map[string]interface{}
		json.NewDecoder(res.Body).Decode(&errResp)
		return nil, fmt.Errorf("erro ES [%s]: %v", res.Status(), errResp)
	}

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
		Aggregations map[string]json.RawMessage `json:"aggregations"`
	}
	if err := json.NewDecoder(res.Body).Decode(&esResp); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta: %w", err)
	}

	hits := make([]map[string]interface{}, 0, len(esResp.Hits.Hits))
	for _, hit := range esResp.Hits.Hits {
		hit.Source["_id"] = hit.ID
		hits = append(hits, hit.Source)
	}

	return &SearchResult{
		Total:        esResp.Hits.Total.Value,
		Hits:         hits,
		Aggregations: parseAggregations(esResp.Aggregations),
	}, nil
}

// GetByID busca uma IES pelo seu co_ies (que também é o _id do documento).
func (r *ElasticsearchRepository) GetByID(ctx context.Context, coIES string) (*IES, error) {
	res, err := r.client.Get(
		r.index,
		coIES,
		r.client.Get.WithContext(ctx),
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar ies: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode == http.StatusNotFound {
		return nil, ErrNotFound
	}
	if res.IsError() {
		return nil, fmt.Errorf("erro ES [%s]", res.Status())
	}

	var parsed struct {
		Source IES `json:"_source"`
	}
	if err := json.NewDecoder(res.Body).Decode(&parsed); err != nil {
		return nil, fmt.Errorf("erro ao decodificar ies: %w", err)
	}

	return &parsed.Source, nil
}
