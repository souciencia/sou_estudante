package cursos

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/shared"
)

// ErrNotFound indica que o curso solicitado não existe no índice.
var ErrNotFound = errors.New("curso não encontrado")

// Repository define contrato de acesso a cursos
type Repository interface {
	Search(ctx context.Context, query string, filters SearchFilterParams, page, limit int) (*SearchResult, error)
	GetByID(ctx context.Context, id string) (*Curso, error)
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

// buildTextQuery monta a cláusula de busca textual por nome do curso.
// Usa operator "and" para exigir que todos os termos digitados estejam
// presentes em um mesmo campo, evitando que conectivos (ex.: "de", "e")
// ou termos isolados correspondam a documentos irrelevantes e inflem o total.
func buildTextQuery(query string) map[string]interface{} {
	return map[string]interface{}{
		"multi_match": map[string]interface{}{
			"query": query,
			"fields": []string{
				"curso.no_curso^3",
				"curso.cine.no_cine_rotulo^2",
			},
			"type":      "best_fields",
			"operator":  "and",
			"fuzziness": "AUTO",
		},
	}
}

// buildExactNameQuery monta a cláusula de busca por nome exato do curso.
// Usado quando o termo digitado corresponde ao nome de um curso existente,
// para que nomes parecidos (ex.: "MEDICINA VETERINÁRIA") não apareçam juntos.
// O campo "exato" usa um normalizer que ignora caixa e acentos.
func buildExactNameQuery(name string) map[string]interface{} {
	return map[string]interface{}{
		"term": map[string]interface{}{
			"curso.no_curso.exato": name,
		},
	}
}

// categoriaTerms traduz o rótulo de categoria exibido na UI para os valores de
// categoria_administrativa indexados a partir dos dados da IES.
func categoriaTerms(categoria string) []string {
	return shared.CategoriaTerms(categoria)
}

// categoriaFilter monta a cláusula de filtro por categoria administrativa.
func categoriaFilter(categoria string) map[string]interface{} {
	terms := categoriaTerms(categoria)
	if len(terms) == 0 {
		return nil
	}
	return map[string]interface{}{
		"terms": map[string]interface{}{
			"instituicao.categoria_administrativa": terms,
		},
	}
}

// hasExactCourseName verifica se existe ao menos um documento cujo nome de
// curso seja exatamente igual a name (ignorando caixa).
func (r *ElasticsearchRepository) hasExactCourseName(ctx context.Context, name string) (bool, error) {
	esQuery := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"filter": []map[string]interface{}{
					{"term": map[string]interface{}{"curso.no_curso.exato": name}},
				},
			},
		},
		"size": 0,
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(esQuery); err != nil {
		return false, fmt.Errorf("erro ao montar query de nome exato: %w", err)
	}

	res, err := r.client.Search(
		r.client.Search.WithContext(ctx),
		r.client.Search.WithIndex(r.index),
		r.client.Search.WithBody(&buf),
		r.client.Search.WithTrackTotalHits(true),
	)
	if err != nil {
		return false, fmt.Errorf("erro ao executar busca de nome exato: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		var errResp map[string]interface{}
		json.NewDecoder(res.Body).Decode(&errResp)
		return false, fmt.Errorf("erro ES [%s]: %v", res.Status(), errResp)
	}

	var esResp struct {
		Hits struct {
			Total struct {
				Value int `json:"value"`
			} `json:"total"`
		} `json:"hits"`
	}
	if err := json.NewDecoder(res.Body).Decode(&esResp); err != nil {
		return false, fmt.Errorf("erro ao decodificar resposta: %w", err)
	}

	return esResp.Hits.Total.Value > 0, nil
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
			if clause := categoriaFilter(cat); clause != nil {
				shouldCategorias = append(shouldCategorias, clause)
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
	mustQuery := buildTextQuery(query)

	if filters.Exact {
		normalizedQuery := strings.ToUpper(strings.TrimSpace(query))

		hasExactName, err := r.hasExactCourseName(ctx, normalizedQuery)
		if err != nil {
			return nil, err
		}

		if hasExactName {
			mustQuery = buildExactNameQuery(normalizedQuery)
		}
	}

	boolQuery := map[string]interface{}{
		"must": mustQuery,
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
						"Privada":   categoriaFilter("privada"),
						"Federal":   categoriaFilter("federal"),
						"Estadual":  categoriaFilter("estadual"),
						"Municipal": categoriaFilter("municipal"),
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

	// 6. Executar search no Elasticsearch
	resp, err := shared.ExecuteSearch(ctx, r.client, r.index, esQuery)
	if err != nil {
		return nil, err
	}

	// 7. Montar resultado
	var searchAggs *SearchAggregations
	if len(resp.Aggregations) > 0 {
		searchAggs = &SearchAggregations{
			UFs:         shared.ParseBuckets(resp.Aggregations, "ufs"),
			Turnos:      shared.ParseBuckets(resp.Aggregations, "turnos"),
			Graus:       shared.ParseBuckets(resp.Aggregations, "graus"),
			Categorias:  shared.ParseBuckets(resp.Aggregations, "categorias"),
			Modalidades: shared.ParseBuckets(resp.Aggregations, "modalidades"),
			Enades:      shared.ParseBuckets(resp.Aggregations, "enades"),
		}
	}

	return &SearchResult{
		Total:        resp.Total,
		Hits:         resp.Hits,
		Aggregations: searchAggs,
	}, nil
}

// GetByID busca um curso pelo seu sequencial (que também é o _id do documento).
func (r *ElasticsearchRepository) GetByID(ctx context.Context, id string) (*Curso, error) {
	return shared.GetByID[Curso](ctx, r.client, r.index, id, "curso", ErrNotFound)
}
