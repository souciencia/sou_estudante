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
	Total        int
	Hits         []map[string]interface{}
	Aggregations *SearchAggregations
}

// NewElasticsearchRepository cria nova instância do repository
func NewElasticsearchRepository(client *elasticsearch.Client) Repository {
	return &ElasticsearchRepository{
		client: client,
		index:  "cursos", // Índice de cursos
	}
}

// Search executa busca no Elasticsearch com filtros cumulativos, ordenação e agregações
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

	if len(filters.UF) > 0 {
		ufs := make([]string, len(filters.UF))
		for i, uf := range filters.UF {
			ufs[i] = strings.ToUpper(uf)
		}
		filterClauses = append(filterClauses, map[string]interface{}{
			"terms": map[string]interface{}{
				"localizacao.sg_uf.keyword": ufs,
			},
		})
	}

	if len(filters.Grau) > 0 {
		shouldGraus := make([]map[string]interface{}, 0, len(filters.Grau))
		for _, grau := range filters.Grau {
			shouldGraus = append(shouldGraus, map[string]interface{}{
				"match": map[string]interface{}{
					"curso.no_grau_academico": grau,
				},
			})
		}
		filterClauses = append(filterClauses, map[string]interface{}{
			"bool": map[string]interface{}{
				"should":               shouldGraus,
				"minimum_should_match": 1,
			},
		})
	}

	if len(filters.Modalidade) > 0 {
		shouldModalidades := []map[string]interface{}{}
		for _, mod := range filters.Modalidade {
			if strings.EqualFold(mod, "EaD") || strings.Contains(strings.ToLower(mod), "distância") {
				shouldModalidades = append(shouldModalidades,
					map[string]interface{}{"term": map[string]interface{}{"curso.tp_modalidade_ensino.keyword": "2"}},
					map[string]interface{}{"match": map[string]interface{}{"curso.no_modalidade_ensino": "DISTÂNCIA"}},
				)
			} else {
				shouldModalidades = append(shouldModalidades,
					map[string]interface{}{"term": map[string]interface{}{"curso.tp_modalidade_ensino.keyword": "1"}},
					map[string]interface{}{"match": map[string]interface{}{"curso.no_modalidade_ensino": "PRESENCIAL"}},
				)
			}
		}
		filterClauses = append(filterClauses, map[string]interface{}{
			"bool": map[string]interface{}{
				"should":               shouldModalidades,
				"minimum_should_match": 1,
			},
		})
	}

	if len(filters.Categoria) > 0 {
		shouldCategorias := []map[string]interface{}{}
		for _, cat := range filters.Categoria {
			switch strings.ToLower(cat) {
			case "privada":
				shouldCategorias = append(shouldCategorias, map[string]interface{}{
					"term": map[string]interface{}{"curso.in_gratuito": false},
				})
			case "federal":
				shouldCategorias = append(shouldCategorias, map[string]interface{}{
					"bool": map[string]interface{}{
						"must": []map[string]interface{}{
							{"term": map[string]interface{}{"curso.in_gratuito": true}},
							{"term": map[string]interface{}{"sisu.tem_sisu": true}},
						},
					},
				})
			case "estadual":
				shouldCategorias = append(shouldCategorias, map[string]interface{}{
					"bool": map[string]interface{}{
						"must": []map[string]interface{}{
							{"term": map[string]interface{}{"curso.in_gratuito": true}},
							{"term": map[string]interface{}{"sisu.tem_sisu": false}},
						},
					},
				})
			case "municipal":
				shouldCategorias = append(shouldCategorias, map[string]interface{}{
					"term": map[string]interface{}{"curso.in_gratuito": true},
				})
			}
		}
		if len(shouldCategorias) > 0 {
			filterClauses = append(filterClauses, map[string]interface{}{
				"bool": map[string]interface{}{
					"should":               shouldCategorias,
					"minimum_should_match": 1,
				},
			})
		}
	}

	if len(filters.Enade) > 0 {
		filterClauses = append(filterClauses, map[string]interface{}{
			"terms": map[string]interface{}{
				"enade.conceito_faixa_enade.keyword": filters.Enade,
			},
		})
	}

	if len(filters.Turno) > 0 {
		shouldTurnos := []map[string]interface{}{}
		for _, turno := range filters.Turno {
			switch strings.ToLower(turno) {
			case "noturno":
				shouldTurnos = append(shouldTurnos,
					map[string]interface{}{"range": map[string]interface{}{"censo_metricas.qt_vg_total_noturno": map[string]interface{}{"gt": 0}}},
					map[string]interface{}{"match": map[string]interface{}{"sisu.ofertas.turno": "NOTURNO"}},
				)
			case "diurno":
				shouldTurnos = append(shouldTurnos,
					map[string]interface{}{"range": map[string]interface{}{"censo_metricas.qt_vg_total_diurno": map[string]interface{}{"gt": 0}}},
					map[string]interface{}{"match": map[string]interface{}{"sisu.ofertas.turno": "MATUTINO"}},
					map[string]interface{}{"match": map[string]interface{}{"sisu.ofertas.turno": "VESPERTINO"}},
				)
			case "integral":
				shouldTurnos = append(shouldTurnos,
					map[string]interface{}{"match": map[string]interface{}{"sisu.ofertas.turno": "INTEGRAL"}},
				)
			case "ead":
				shouldTurnos = append(shouldTurnos,
					map[string]interface{}{"range": map[string]interface{}{"censo_metricas.qt_vg_total_ead": map[string]interface{}{"gt": 0}}},
				)
			}
		}
		filterClauses = append(filterClauses, map[string]interface{}{
			"bool": map[string]interface{}{
				"should":               shouldTurnos,
				"minimum_should_match": 1,
			},
		})
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

	// 5. Query DSL completa com Agregações
	esQuery := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": boolQuery,
		},
		"size": limit,
		"from": from,
		"sort": sortClauses,
		"aggs": map[string]interface{}{
			"ufs": map[string]interface{}{
				"terms": map[string]interface{}{
					"field": "localizacao.sg_uf.keyword",
					"size":  30,
				},
			},
			"graus": map[string]interface{}{
				"terms": map[string]interface{}{
					"field": "curso.no_grau_academico.keyword",
					"size":  10,
				},
			},
			"modalidades": map[string]interface{}{
				"terms": map[string]interface{}{
					"field": "curso.no_modalidade_ensino.keyword",
					"size":  10,
				},
			},
			"enades": map[string]interface{}{
				"terms": map[string]interface{}{
					"field": "enade.conceito_faixa_enade.keyword",
					"size":  10,
				},
			},
			"categorias": map[string]interface{}{
				"filters": map[string]interface{}{
					"filters": map[string]interface{}{
						"Privada": map[string]interface{}{
							"term": map[string]interface{}{"curso.in_gratuito": false},
						},
						"Federal": map[string]interface{}{
							"bool": map[string]interface{}{
								"must": []map[string]interface{}{
									{"term": map[string]interface{}{"curso.in_gratuito": true}},
									{"term": map[string]interface{}{"sisu.tem_sisu": true}},
								},
							},
						},
						"Estadual": map[string]interface{}{
							"bool": map[string]interface{}{
								"must": []map[string]interface{}{
									{"term": map[string]interface{}{"curso.in_gratuito": true}},
									{"term": map[string]interface{}{"sisu.tem_sisu": false}},
								},
							},
						},
						"Municipal": map[string]interface{}{
							"term": map[string]interface{}{"curso.in_gratuito": true},
						},
					},
				},
			},
			"turnos": map[string]interface{}{
				"filters": map[string]interface{}{
					"filters": map[string]interface{}{
						"Diurno": map[string]interface{}{
							"bool": map[string]interface{}{
								"should": []map[string]interface{}{
									{"range": map[string]interface{}{"censo_metricas.qt_vg_total_diurno": map[string]interface{}{"gt": 0}}},
									{"match": map[string]interface{}{"sisu.ofertas.turno": "MATUTINO"}},
									{"match": map[string]interface{}{"sisu.ofertas.turno": "VESPERTINO"}},
								},
							},
						},
						"Noturno": map[string]interface{}{
							"bool": map[string]interface{}{
								"should": []map[string]interface{}{
									{"range": map[string]interface{}{"censo_metricas.qt_vg_total_noturno": map[string]interface{}{"gt": 0}}},
									{"match": map[string]interface{}{"sisu.ofertas.turno": "NOTURNO"}},
								},
							},
						},
						"Integral": map[string]interface{}{
							"match": map[string]interface{}{"sisu.ofertas.turno": "INTEGRAL"},
						},
						"EaD": map[string]interface{}{
							"range": map[string]interface{}{"censo_metricas.qt_vg_total_ead": map[string]interface{}{"gt": 0}},
						},
					},
				},
			},
		},
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
		Aggregations map[string]json.RawMessage `json:"aggregations"`
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

	var searchAggs *SearchAggregations
	if len(esResp.Aggregations) > 0 {
		parseBuckets := func(name string) []AggregationBucket {
			raw, ok := esResp.Aggregations[name]
			if !ok {
				return nil
			}

			// 1. Tentar array buckets (ex: terms aggregation)
			var arrayAgg struct {
				Buckets []struct {
					Key      interface{} `json:"key"`
					DocCount int         `json:"doc_count"`
				} `json:"buckets"`
			}
			if err := json.Unmarshal(raw, &arrayAgg); err == nil && len(arrayAgg.Buckets) > 0 {
				buckets := make([]AggregationBucket, 0, len(arrayAgg.Buckets))
				for _, b := range arrayAgg.Buckets {
					buckets = append(buckets, AggregationBucket{
						Key:   fmt.Sprintf("%v", b.Key),
						Count: b.DocCount,
					})
				}
				return buckets
			}

			// 2. Tentar map buckets (ex: filters aggregation)
			var mapAgg struct {
				Buckets map[string]struct {
					DocCount int `json:"doc_count"`
				} `json:"buckets"`
			}
			if err := json.Unmarshal(raw, &mapAgg); err == nil && len(mapAgg.Buckets) > 0 {
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

		searchAggs = &SearchAggregations{
			UFs:         parseBuckets("ufs"),
			Turnos:      parseBuckets("turnos"),
			Graus:       parseBuckets("graus"),
			Categorias:  parseBuckets("categorias"),
			Modalidades: parseBuckets("modalidades"),
			Enades:      parseBuckets("enades"),
		}
	}

	return &SearchResult{
		Total:        esResp.Hits.Total.Value,
		Hits:         hits,
		Aggregations: searchAggs,
	}, nil
}
