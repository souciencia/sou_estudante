package cursos

import (
	"context"
	"errors"
	"strings"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/domain"
	"api_estudante/internal/elasticsearch"
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
	client *es.Client
	index  string
}

// SearchResult encapsula resposta do Elasticsearch
type SearchResult struct {
	Total        int
	Hits         []Curso
	Aggregations *SearchAggregations
}

// NewElasticsearchRepository cria nova instância do repository
func NewElasticsearchRepository(client *es.Client) Repository {
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

// categoriaFilter monta a cláusula de filtro por categoria administrativa,
// traduzindo o rótulo da UI para os valores de categoria_administrativa da IES.
func categoriaFilter(categoria string) map[string]interface{} {
	terms := domain.CategoriaTerms(categoria)
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

	resp, err := elasticsearch.ExecuteSearch[Curso](ctx, r.client, r.index, esQuery)
	if err != nil {
		return false, err
	}
	return resp.Total > 0, nil
}

// shouldClause monta um bool query que exige ao menos uma das cláusulas.
func shouldClause(clauses []map[string]interface{}) map[string]interface{} {
	return map[string]interface{}{
		"bool": map[string]interface{}{
			"should":               clauses,
			"minimum_should_match": 1,
		},
	}
}

// termsAggregation monta uma agregação de termos para um campo keyword.
func termsAggregation(field string, size int) map[string]interface{} {
	return map[string]interface{}{
		"terms": map[string]interface{}{
			"field": field,
			"size":  size,
		},
	}
}

// modalidadeShouldClauses retorna as cláusulas que identificam uma modalidade.
func modalidadeShouldClauses(modalidade string) []map[string]interface{} {
	if strings.EqualFold(modalidade, "EaD") || strings.Contains(strings.ToLower(modalidade), "distância") {
		return []map[string]interface{}{
			{"term": map[string]interface{}{"curso.tp_modalidade_ensino": "2"}},
			{"match": map[string]interface{}{"curso.no_modalidade_ensino": "DISTÂNCIA"}},
		}
	}
	return []map[string]interface{}{
		{"term": map[string]interface{}{"curso.tp_modalidade_ensino": "1"}},
		{"match": map[string]interface{}{"curso.no_modalidade_ensino": "PRESENCIAL"}},
	}
}

// turnoShouldClauses retorna as cláusulas que identificam um turno.
func turnoShouldClauses(turno string) []map[string]interface{} {
	switch strings.ToLower(turno) {
	case "noturno":
		return []map[string]interface{}{
			{"range": map[string]interface{}{"censo_metricas.qt_vg_total_noturno": map[string]interface{}{"gt": 0}}},
			{"match": map[string]interface{}{"sisu.ofertas.turno": "NOTURNO"}},
		}
	case "diurno":
		return []map[string]interface{}{
			{"range": map[string]interface{}{"censo_metricas.qt_vg_total_diurno": map[string]interface{}{"gt": 0}}},
			{"match": map[string]interface{}{"sisu.ofertas.turno": "MATUTINO"}},
			{"match": map[string]interface{}{"sisu.ofertas.turno": "VESPERTINO"}},
		}
	case "integral":
		return []map[string]interface{}{
			{"match": map[string]interface{}{"sisu.ofertas.turno": "INTEGRAL"}},
		}
	case "ead":
		return []map[string]interface{}{
			{"range": map[string]interface{}{"censo_metricas.qt_vg_total_ead": map[string]interface{}{"gt": 0}}},
		}
	default:
		return nil
	}
}

// buildFilterClauses monta as cláusulas de filtro cumulativas da busca de cursos.
// Os campos de agregação/filtro já são keyword no índice, portanto não levam o
// sufixo ".keyword" (que resultaria em campo inexistente e buckets vazios).
func buildFilterClauses(filters SearchFilterParams) []map[string]interface{} {
	clauses := []map[string]interface{}{}

	if len(filters.UF) > 0 {
		ufs := make([]string, len(filters.UF))
		for i, uf := range filters.UF {
			ufs[i] = strings.ToUpper(uf)
		}
		clauses = append(clauses, map[string]interface{}{
			"terms": map[string]interface{}{
				"localizacao.sg_uf": ufs,
			},
		})
	}

	if len(filters.Grau) > 0 {
		should := make([]map[string]interface{}, 0, len(filters.Grau))
		for _, grau := range filters.Grau {
			should = append(should, map[string]interface{}{
				"match": map[string]interface{}{
					"curso.no_grau_academico": grau,
				},
			})
		}
		clauses = append(clauses, shouldClause(should))
	}

	if len(filters.Modalidade) > 0 {
		should := []map[string]interface{}{}
		for _, mod := range filters.Modalidade {
			should = append(should, modalidadeShouldClauses(mod)...)
		}
		clauses = append(clauses, shouldClause(should))
	}

	if len(filters.Categoria) > 0 {
		should := []map[string]interface{}{}
		for _, cat := range filters.Categoria {
			if clause := categoriaFilter(cat); clause != nil {
				should = append(should, clause)
			}
		}
		if len(should) > 0 {
			clauses = append(clauses, shouldClause(should))
		}
	}

	if len(filters.Enade) > 0 {
		clauses = append(clauses, map[string]interface{}{
			"terms": map[string]interface{}{
				"enade.conceito_faixa_enade": filters.Enade,
			},
		})
	}

	if len(filters.Turno) > 0 {
		should := []map[string]interface{}{}
		for _, turno := range filters.Turno {
			should = append(should, turnoShouldClauses(turno)...)
		}
		clauses = append(clauses, shouldClause(should))
	}

	return clauses
}

// buildSortClauses define a ordenação: Enade, desistência, alfabética ou relevância (padrão).
func buildSortClauses(sort string) []map[string]interface{} {
	switch sort {
	case "enade":
		return []map[string]interface{}{
			{"enade.conceito_continuo_enade": map[string]interface{}{
				"order":   "desc",
				"missing": "_last",
			}},
		}
	case "desistencia":
		return []map[string]interface{}{
			{"tda.tda": map[string]interface{}{
				"order":   "asc",
				"missing": "_last",
			}},
		}
	case "az":
		return []map[string]interface{}{
			{"curso.no_curso.keyword": map[string]interface{}{
				"order": "asc",
			}},
		}
	default:
		return []map[string]interface{}{
			{"_score": "desc"},
		}
	}
}

// buildAggregations monta as agregações usadas pelos filtros da UI.
func buildAggregations() map[string]interface{} {
	return map[string]interface{}{
		"ufs":         termsAggregation("localizacao.sg_uf", 30),
		"graus":       termsAggregation("curso.no_grau_academico", 10),
		"modalidades": termsAggregation("curso.no_modalidade_ensino", 10),
		"enades":      termsAggregation("enade.conceito_faixa_enade", 10),
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
					"Diurno":   shouldClause(turnoShouldClauses("diurno")),
					"Noturno":  shouldClause(turnoShouldClauses("noturno")),
					"Integral": shouldClause(turnoShouldClauses("integral")),
					"EaD":      shouldClause(turnoShouldClauses("ead")),
				},
			},
		},
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
	filterClauses := buildFilterClauses(filters)

	// 3. Montar bool query
	mustQuery := buildTextQuery(query)

	if filters.Exact {
		exactName := strings.TrimSpace(query)

		hasExactName, err := r.hasExactCourseName(ctx, exactName)
		if err != nil {
			return nil, err
		}

		if hasExactName {
			mustQuery = buildExactNameQuery(exactName)
		}
	}

	boolQuery := map[string]interface{}{
		"must": mustQuery,
	}

	if len(filterClauses) > 0 {
		boolQuery["filter"] = filterClauses
	}

	// 4. Query DSL completa com ordenação e agregações
	esQuery := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": boolQuery,
		},
		"size": limit,
		"from": from,
		"sort": buildSortClauses(filters.Sort),
		"aggs": buildAggregations(),
	}

	// 5. Executar search no Elasticsearch
	resp, err := elasticsearch.ExecuteSearch[Curso](ctx, r.client, r.index, esQuery)
	if err != nil {
		return nil, err
	}

	// 6. Montar resultado
	var searchAggs *SearchAggregations
	if len(resp.Aggregations) > 0 {
		searchAggs = &SearchAggregations{
			UFs:         elasticsearch.ParseBuckets(resp.Aggregations, "ufs"),
			Turnos:      elasticsearch.ParseBuckets(resp.Aggregations, "turnos"),
			Graus:       elasticsearch.ParseBuckets(resp.Aggregations, "graus"),
			Categorias:  elasticsearch.ParseBuckets(resp.Aggregations, "categorias"),
			Modalidades: elasticsearch.ParseBuckets(resp.Aggregations, "modalidades"),
			Enades:      elasticsearch.ParseBuckets(resp.Aggregations, "enades"),
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
	return elasticsearch.GetByID[Curso](ctx, r.client, r.index, id, "curso", ErrNotFound)
}
