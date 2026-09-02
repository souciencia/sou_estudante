package cursos

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"
)

// Repository define contrato de acesso a cursos
type Repository interface {
	Search(ctx context.Context, query string, filters SearchFilterParams, page, limit int) (*SearchResult, error)
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

// Search executa busca no Elasticsearch com filtros e ordenação
func (r *ElasticsearchRepository) Search(
	ctx context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*SearchResult, error) {
	// 1. Calcular offset para paginação
	from := (page - 1) * limit

	// 2. Construir cláusulas de filtro
	filterClauses := []map[string]interface{}{}

	if filters.UF != "" {
		filterClauses = append(filterClauses, map[string]interface{}{
			"term": map[string]interface{}{
				"localizacao.sg_uf.keyword": strings.ToUpper(filters.UF),
			},
		})
	}

	if filters.Grau != "" {
		filterClauses = append(filterClauses, map[string]interface{}{
			"match": map[string]interface{}{
				"curso.no_grau_academico": filters.Grau,
			},
		})
	}

	if filters.Modalidade != "" {
		if strings.EqualFold(filters.Modalidade, "EaD") || strings.Contains(strings.ToLower(filters.Modalidade), "distância") {
			filterClauses = append(filterClauses, map[string]interface{}{
				"bool": map[string]interface{}{
					"should": []map[string]interface{}{
						{"term": map[string]interface{}{"curso.tp_modalidade_ensino.keyword": "2"}},
						{"match": map[string]interface{}{"curso.no_modalidade_ensino": "DISTÂNCIA"}},
					},
					"minimum_should_match": 1,
				},
			})
		} else {
			filterClauses = append(filterClauses, map[string]interface{}{
				"bool": map[string]interface{}{
					"should": []map[string]interface{}{
						{"term": map[string]interface{}{"curso.tp_modalidade_ensino.keyword": "1"}},
						{"match": map[string]interface{}{"curso.no_modalidade_ensino": "PRESENCIAL"}},
					},
					"minimum_should_match": 1,
				},
			})
		}
	}

	if filters.Enade != "" {
		filterClauses = append(filterClauses, map[string]interface{}{
			"term": map[string]interface{}{
				"enade.conceito_faixa_enade.keyword": filters.Enade,
			},
		})
	}

	if filters.Turno != "" {
		switch strings.ToLower(filters.Turno) {
		case "noturno":
			filterClauses = append(filterClauses, map[string]interface{}{
				"bool": map[string]interface{}{
					"should": []map[string]interface{}{
						{"range": map[string]interface{}{"censo_metricas.qt_vg_total_noturno": map[string]interface{}{"gt": 0}}},
						{"match": map[string]interface{}{"sisu.ofertas.turno": "NOTURNO"}},
					},
					"minimum_should_match": 1,
				},
			})
		case "diurno":
			filterClauses = append(filterClauses, map[string]interface{}{
				"bool": map[string]interface{}{
					"should": []map[string]interface{}{
						{"range": map[string]interface{}{"censo_metricas.qt_vg_total_diurno": map[string]interface{}{"gt": 0}}},
						{"match": map[string]interface{}{"sisu.ofertas.turno": "MATUTINO"}},
						{"match": map[string]interface{}{"sisu.ofertas.turno": "VESPERTINO"}},
					},
					"minimum_should_match": 1,
				},
			})
		case "integral":
			filterClauses = append(filterClauses, map[string]interface{}{
				"match": map[string]interface{}{"sisu.ofertas.turno": "INTEGRAL"},
			})
		case "ead":
			filterClauses = append(filterClauses, map[string]interface{}{
				"range": map[string]interface{}{"censo_metricas.qt_vg_total_ead": map[string]interface{}{"gt": 0}},
			})
		}
	}

	// 3. Montar bool query
	boolQuery := map[string]interface{}{
		"must": map[string]interface{}{
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
	}

	if len(filterClauses) > 0 {
		boolQuery["filter"] = filterClauses
	}

	// 4. Configurar ordenação
	sortClauses := []map[string]interface{}{}
	switch filters.Sort {
	case "enade":
		sortClauses = append(sortClauses, map[string]interface{}{
			"enade.conceito_continuo_enade": map[string]interface{}{
				"order":   "desc",
				"missing": "_last",
			},
		})
	case "desistencia":
		sortClauses = append(sortClauses, map[string]interface{}{
			"tda.tda": map[string]interface{}{
				"order":   "asc",
				"missing": "_last",
			},
		})
	case "az":
		sortClauses = append(sortClauses, map[string]interface{}{
			"curso.no_curso.keyword": map[string]interface{}{
				"order": "asc",
			},
		})
	default:
		sortClauses = append(sortClauses, map[string]interface{}{
			"_score": "desc",
		})
	}

	// 5. Query DSL completa
	esQuery := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": boolQuery,
		},
		"size": limit,
		"from": from,
		"sort": sortClauses,
	}

	// 6. Serializar para JSON
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(esQuery); err != nil {
		return nil, fmt.Errorf("erro ao montar query: %w", err)
	}

	// 7. Executar search no Elasticsearch
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

	// 8. Verificar erro HTTP
	if res.IsError() {
		var errResp map[string]interface{}
		json.NewDecoder(res.Body).Decode(&errResp)
		return nil, fmt.Errorf("erro ES [%s]: %v", res.Status(), errResp)
	}

	// 9. Parse da resposta
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

	// 10. Montar resultado
	hits := make([]map[string]interface{}, 0, len(esResp.Hits.Hits))
	for _, hit := range esResp.Hits.Hits {
		hit.Source["_id"] = hit.ID
		hits = append(hits, hit.Source)
	}

	return &SearchResult{
		Total: esResp.Hits.Total.Value,
		Hits:  hits,
	}, nil
}
