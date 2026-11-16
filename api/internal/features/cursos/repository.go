package cursos

import (
	"context"
	"errors"
	"strings"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/elasticsearch"
	"api_estudante/internal/textcase"
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

// NewElasticsearchRepository cria nova instância do repository sobre o índice
// de cursos informado (config.CursosIndexName).
func NewElasticsearchRepository(client *es.Client, index string) Repository {
	return &ElasticsearchRepository{
		client: client,
		index:  index,
	}
}

// buildTextQuery monta a cláusula de busca textual por nome do curso.
// Usa operator "and" para exigir que todos os termos digitados estejam
// presentes em um mesmo campo, evitando que conectivos (ex.: "de", "e")
// ou termos isolados correspondam a documentos irrelevantes e inflem o total.
func buildTextQuery(query string) map[string]any {
	return map[string]any{
		"multi_match": map[string]any{
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
func buildExactNameQuery(name string) map[string]any {
	return map[string]any{
		"term": map[string]any{
			"curso.no_curso.exato": name,
		},
	}
}

// categoriaField é o campo keyword da categoria administrativa da IES dentro
// do documento de curso.
const categoriaField = "instituicao.categoria_administrativa"

// categoriaFilter monta a cláusula de filtro por categoria administrativa,
// traduzindo o rótulo da UI para os valores de categoria_administrativa da IES.
func categoriaFilter(categoria string) map[string]any {
	return elasticsearch.CategoriaFilter(categoriaField, categoria)
}

// sisuTerm monta a cláusula que seleciona cursos com ingresso pelo Sisu
// (tem_sisu == true), usada tanto no filtro quanto na agregação "ingresso".
func sisuTerm() map[string]any {
	return map[string]any{
		"term": map[string]any{"sisu.tem_sisu": true},
	}
}

// gratuitoTerm monta a cláusula que seleciona cursos gratuitos
// (in_gratuito == true), usada tanto no filtro quanto na agregação "ingresso".
func gratuitoTerm() map[string]any {
	return map[string]any{
		"term": map[string]any{"curso.in_gratuito": true},
	}
}

// enadeField é o campo keyword da faixa do conceito Enade no documento de curso.
const enadeField = "enade.conceito_faixa_enade"

// enadeSemAvaliacaoClause seleciona cursos sem avaliação no ciclo do Enade, ou
// seja, cuja faixa de conceito está ausente no documento.
func enadeSemAvaliacaoClause() map[string]any {
	return map[string]any{
		"bool": map[string]any{
			"must_not": []map[string]any{
				{"exists": map[string]any{"field": enadeField}},
			},
		},
	}
}

// enadeFilterClauses traduz os valores do filtro Enade em cláusulas: faixas
// numéricas e "SC" viram terms; "sem avaliação no ciclo" vira a ausência do
// campo. As cláusulas retornadas se combinam com "ou" pelo chamador.
func enadeFilterClauses(enades []string) []map[string]any {
	var terms []string
	var clauses []map[string]any
	for _, enade := range enades {
		if strings.EqualFold(strings.TrimSpace(enade), "sem avaliação no ciclo") {
			clauses = append(clauses, enadeSemAvaliacaoClause())
			continue
		}
		terms = append(terms, enade)
	}
	if len(terms) > 0 {
		clauses = append(clauses, elasticsearch.TermsFilter(enadeField, terms))
	}
	return clauses
}

// hasExactCourseName verifica se existe ao menos um documento cujo nome de
// curso seja exatamente igual a name (ignorando caixa).
func (r *ElasticsearchRepository) hasExactCourseName(ctx context.Context, name string) (bool, error) {
	esQuery := map[string]any{
		"query": map[string]any{
			"bool": map[string]any{
				"filter": []map[string]any{
					{"term": map[string]any{"curso.no_curso.exato": name}},
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

// modalidadeShouldClauses retorna as cláusulas que identificam uma modalidade.
// O código `tp_modalidade_ensino` é o identificador confiável; o nome é uma
// segunda via (já normalizada na caixa de título, como na ingestão).
func modalidadeShouldClauses(modalidade string) []map[string]any {
	if strings.EqualFold(modalidade, "EaD") || strings.Contains(strings.ToLower(modalidade), "distância") {
		return []map[string]any{
			{"term": map[string]any{"curso.tp_modalidade_ensino": "2"}},
			{"match": map[string]any{"curso.no_modalidade_ensino": "Distância"}},
		}
	}
	return []map[string]any{
		{"term": map[string]any{"curso.tp_modalidade_ensino": "1"}},
		{"match": map[string]any{"curso.no_modalidade_ensino": "Presencial"}},
	}
}

// turnoNestedTerms monta um filtro nested sobre as ofertas do Sisu cujo turno
// esteja entre os valores informados, já no formato gravado (caixa de título).
func turnoNestedTerms(turnos ...string) map[string]any {
	return map[string]any{
		"nested": map[string]any{
			"path": "sisu.ofertas",
			"query": map[string]any{
				"terms": map[string]any{"sisu.ofertas.turno": turnos},
			},
		},
	}
}

// turnoShouldClauses retorna as cláusulas que identificam um turno, combinando
// a contagem de vagas do censo com as ofertas do Sisu (nested).
func turnoShouldClauses(turno string) []map[string]any {
	switch strings.ToLower(turno) {
	case "noturno":
		return []map[string]any{
			{"range": map[string]any{"censo_metricas.qt_vg_total_noturno": map[string]any{"gt": 0}}},
			turnoNestedTerms("Noturno"),
		}
	case "diurno":
		return []map[string]any{
			{"range": map[string]any{"censo_metricas.qt_vg_total_diurno": map[string]any{"gt": 0}}},
			turnoNestedTerms("Matutino", "Vespertino"),
		}
	case "integral":
		return []map[string]any{
			turnoNestedTerms("Integral"),
		}
	case "ead":
		return []map[string]any{
			{"range": map[string]any{"censo_metricas.qt_vg_total_ead": map[string]any{"gt": 0}}},
		}
	default:
		return nil
	}
}

// facetOrder define a ordem estável das cláusulas de filtro (e a base das
// agregações facetadas).
var facetOrder = []string{"uf", "municipio", "grau", "modalidade", "categoria", "enade", "ingresso", "turno"}

// clausesByFacet monta a cláusula de filtro de cada faceta ativa. Os campos já
// são keyword no índice, portanto não levam o sufixo ".keyword" (que resultaria
// em campo inexistente e buckets vazios).
func clausesByFacet(filters SearchFilterParams) map[string]map[string]any {
	clauses := make(map[string]map[string]any)

	if len(filters.UF) > 0 {
		clauses["uf"] = elasticsearch.UpperTermsFilter("localizacao.sg_uf", filters.UF)
	}

	if len(filters.Municipio) > 0 {
		clauses["municipio"] = elasticsearch.TermsFilter("localizacao.co_municipio", filters.Municipio)
	}

	if len(filters.Grau) > 0 {
		should := make([]map[string]any, 0, len(filters.Grau))
		for _, grau := range filters.Grau {
			should = append(should, map[string]any{
				"match": map[string]any{
					// O grau é gravado em caixa de título; normaliza aqui igual à ingestão.
					"curso.no_grau_academico": textcase.Title(grau),
				},
			})
		}
		clauses["grau"] = elasticsearch.AnyOf(should)
	}

	if len(filters.Modalidade) > 0 {
		should := []map[string]any{}
		for _, mod := range filters.Modalidade {
			should = append(should, modalidadeShouldClauses(mod)...)
		}
		clauses["modalidade"] = elasticsearch.AnyOf(should)
	}

	if clause := elasticsearch.CategoriaAnyOf(categoriaField, filters.Categoria); clause != nil {
		clauses["categoria"] = clause
	}

	if len(filters.Enade) > 0 {
		clauses["enade"] = elasticsearch.AnyOf(enadeFilterClauses(filters.Enade))
	}

	if len(filters.Ingresso) > 0 {
		should := make([]map[string]any, 0, len(filters.Ingresso))
		for _, ingresso := range filters.Ingresso {
			switch strings.ToLower(strings.TrimSpace(ingresso)) {
			case "gratuito":
				should = append(should, gratuitoTerm())
			case "sisu":
				should = append(should, sisuTerm())
			}
		}
		if len(should) > 0 {
			clauses["ingresso"] = elasticsearch.AnyOf(should)
		}
	}

	if len(filters.Turno) > 0 {
		should := []map[string]any{}
		for _, turno := range filters.Turno {
			should = append(should, turnoShouldClauses(turno)...)
		}
		clauses["turno"] = elasticsearch.AnyOf(should)
	}

	return clauses
}

// buildFilterClauses monta todas as cláusulas de filtro cumulativas, em ordem
// estável, para o post_filter.
func buildFilterClauses(filters SearchFilterParams) []map[string]any {
	byFacet := clausesByFacet(filters)
	clauses := make([]map[string]any, 0, len(byFacet))
	for _, facet := range facetOrder {
		if clause, ok := byFacet[facet]; ok {
			clauses = append(clauses, clause)
		}
	}
	return clauses
}

// contextClauses devolve todas as cláusulas de filtro exceto a da faceta
// informada. É o filtro que envolve cada agregação facetada, para que a
// contagem reflita o resultado atual preservando a multi-seleção da própria
// faceta.
func contextClauses(filters SearchFilterParams, facet string) []map[string]any {
	byFacet := clausesByFacet(filters)
	clauses := make([]map[string]any, 0, len(byFacet))
	for _, f := range facetOrder {
		if f == facet {
			continue
		}
		if clause, ok := byFacet[f]; ok {
			clauses = append(clauses, clause)
		}
	}
	return clauses
}

// buildSortClauses define a ordenação: Enade, desistência, alfabética ou relevância (padrão).
func buildSortClauses(sort string) []map[string]any {
	switch sort {
	case "enade":
		return []map[string]any{
			{"enade.conceito_continuo_enade": map[string]any{
				"order":   "desc",
				"missing": "_last",
			}},
		}
	case "desistencia":
		return []map[string]any{
			{"tda.tda": map[string]any{
				"order":   "asc",
				"missing": "_last",
			}},
		}
	case "az":
		return []map[string]any{
			{"curso.no_curso.keyword": map[string]any{
				"order": "asc",
			}},
		}
	default:
		return []map[string]any{
			{"_score": "desc"},
		}
	}
}

// buildAggregations monta as agregações usadas pelos filtros da UI. Cada faceta
// é filtrada pelas demais cláusulas ativas (contextClauses), para que sua
// contagem reflita o resultado atual e preserve a própria multi-seleção.
func buildAggregations(filters SearchFilterParams) map[string]any {
	return map[string]any{
		"ufs": elasticsearch.FilteredAgg(
			contextClauses(filters, "uf"),
			elasticsearch.TermsAgg("localizacao.sg_uf", 30),
		),
		// size alto o bastante para não truncar os municípios distintos de um
		// termo de busca (o "q" mínimo tem 5 caracteres, então o conjunto é
		// pequeno na prática).
		"municipios": elasticsearch.FilteredAgg(
			contextClauses(filters, "municipio"),
			elasticsearch.TermsAgg("localizacao.co_municipio", 1000),
		),
		"graus": elasticsearch.FilteredAgg(
			contextClauses(filters, "grau"),
			elasticsearch.TermsAgg("curso.no_grau_academico", 10),
		),
		"modalidades": elasticsearch.FilteredAgg(
			contextClauses(filters, "modalidade"),
			elasticsearch.TermsAgg("curso.no_modalidade_ensino", 10),
		),
		"enades": elasticsearch.FilteredAgg(
			contextClauses(filters, "enade"),
			elasticsearch.FiltersAgg(map[string]any{
				"1":                      elasticsearch.TermsFilter(enadeField, []string{"1"}),
				"2":                      elasticsearch.TermsFilter(enadeField, []string{"2"}),
				"3":                      elasticsearch.TermsFilter(enadeField, []string{"3"}),
				"4":                      elasticsearch.TermsFilter(enadeField, []string{"4"}),
				"5":                      elasticsearch.TermsFilter(enadeField, []string{"5"}),
				"SC":                     elasticsearch.TermsFilter(enadeField, []string{"SC"}),
				"Sem avaliação no Ciclo": enadeSemAvaliacaoClause(),
			}),
		),
		"categorias": elasticsearch.FilteredAgg(
			contextClauses(filters, "categoria"),
			elasticsearch.CategoriasAgg(categoriaField),
		),
		"turnos": elasticsearch.FilteredAgg(
			contextClauses(filters, "turno"),
			elasticsearch.FiltersAgg(map[string]any{
				"Diurno":   elasticsearch.AnyOf(turnoShouldClauses("diurno")),
				"Noturno":  elasticsearch.AnyOf(turnoShouldClauses("noturno")),
				"Integral": elasticsearch.AnyOf(turnoShouldClauses("integral")),
				"EaD":      elasticsearch.AnyOf(turnoShouldClauses("ead")),
			}),
		),
		"ingresso": elasticsearch.FilteredAgg(
			contextClauses(filters, "ingresso"),
			elasticsearch.FiltersAgg(map[string]any{
				"gratuito": gratuitoTerm(),
				"sisu":     sisuTerm(),
			}),
		),
	}
}

// Search executa busca no Elasticsearch com filtros cumulativos, ordenação e agregações
func (r *ElasticsearchRepository) Search(
	ctx context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*SearchResult, error) {
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

	esQuery := elasticsearch.SearchBody(
		mustQuery,
		buildFilterClauses(filters),
		buildSortClauses(filters.Sort),
		buildAggregations(filters),
		page, limit,
	)

	// Executar search no Elasticsearch
	resp, err := elasticsearch.ExecuteSearch[Curso](ctx, r.client, r.index, esQuery)
	if err != nil {
		return nil, err
	}

	// Montar resultado
	var searchAggs *SearchAggregations
	if len(resp.Aggregations) > 0 {
		searchAggs = &SearchAggregations{
			UFs:         elasticsearch.ParseFilteredBuckets(resp.Aggregations, "ufs"),
			Municipios:  elasticsearch.ParseFilteredBuckets(resp.Aggregations, "municipios"),
			Turnos:      elasticsearch.ParseFilteredBuckets(resp.Aggregations, "turnos"),
			Graus:       elasticsearch.ParseFilteredBuckets(resp.Aggregations, "graus"),
			Categorias:  elasticsearch.ParseFilteredBuckets(resp.Aggregations, "categorias"),
			Modalidades: elasticsearch.ParseFilteredBuckets(resp.Aggregations, "modalidades"),
			Enades:      elasticsearch.ParseFilteredBuckets(resp.Aggregations, "enades"),
			Ingresso:    elasticsearch.ParseFilteredBuckets(resp.Aggregations, "ingresso"),
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
