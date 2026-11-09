package ies

import (
	"context"
	"encoding/json"
	"errors"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/elasticsearch"
)

// ErrNotFound indica que a IES solicitada não existe no índice.
var ErrNotFound = errors.New("ies não encontrada")

// Repository define o contrato de acesso às IES.
type Repository interface {
	Search(ctx context.Context, query string, filters SearchFilterParams, page, limit int) (*SearchResult, error)
	GetByID(ctx context.Context, coIES string) (*IES, error)
}

// ElasticsearchRepository implementa Repository usando Elasticsearch.
type ElasticsearchRepository struct {
	client *es.Client
	index  string
}

// SearchResult encapsula a resposta do Elasticsearch.
type SearchResult struct {
	Total        int
	Hits         []IES
	Aggregations *SearchAggregations
}

// NewElasticsearchRepository cria uma nova instância do repository sobre o
// índice de IES informado (config.IESIndexName).
func NewElasticsearchRepository(client *es.Client, index string) Repository {
	return &ElasticsearchRepository{
		client: client,
		index:  index,
	}
}

// buildTextQuery monta a busca textual por nome e sigla da IES. Usa operator
// "and" para exigir todos os termos digitados e evitar correspondências soltas.
func buildTextQuery(query string) map[string]any {
	return map[string]any{
		"multi_match": map[string]any{
			"query":     query,
			"fields":    []string{"no_ies^3", "sg_ies^2"},
			"type":      "best_fields",
			"operator":  "and",
			"fuzziness": "AUTO",
		},
	}
}

// Campos keyword usados nos filtros e agregações do índice ies. A localização,
// a categoria e a organização são objetos aninhados no documento.
const (
	ufField          = "localizacao.sg_uf"
	regiaoField      = "localizacao.no_regiao"
	categoriaField   = "categoria_administrativa.no_categoria_administrativa"
	organizacaoField = "organizacao_academica.no_organizacao_academica"
)

// categoriaFilter monta a cláusula de filtro por categoria administrativa.
func categoriaFilter(categoria string) map[string]any {
	return elasticsearch.CategoriaFilter(categoriaField, categoria)
}

// facetOrder define a ordem estável das cláusulas de filtro (e a base das
// agregações facetadas).
var facetOrder = []string{"uf", "municipio", "regiao", "categoria", "organizacao"}

// clausesByFacet monta a cláusula de filtro de cada faceta ativa.
func clausesByFacet(filters SearchFilterParams) map[string]map[string]any {
	clauses := make(map[string]map[string]any)

	if len(filters.UF) > 0 {
		clauses["uf"] = elasticsearch.UpperTermsFilter(ufField, filters.UF)
	}

	if len(filters.Municipio) > 0 {
		clauses["municipio"] = elasticsearch.TermsFilter("localizacao.co_municipio", filters.Municipio)
	}

	if len(filters.Regiao) > 0 {
		clauses["regiao"] = elasticsearch.TermsFilter(regiaoField, filters.Regiao)
	}

	if clause := elasticsearch.CategoriaAnyOf(categoriaField, filters.Categoria); clause != nil {
		clauses["categoria"] = clause
	}

	if len(filters.Organizacao) > 0 {
		clauses["organizacao"] = elasticsearch.TermsFilter(organizacaoField, filters.Organizacao)
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
// informada (base do filtro que envolve cada agregação facetada).
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

// buildSortClauses define a ordenação: relevância (score) ou alfabética (padrão).
func buildSortClauses(sort string) []map[string]any {
	switch sort {
	case "relevancia", "_score":
		return []map[string]any{
			{"_score": "desc"},
		}
	default:
		return []map[string]any{
			{"no_ies.keyword": map[string]any{"order": "asc"}},
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
			elasticsearch.TermsAgg(ufField, 30),
		),
		"municipios": elasticsearch.FilteredAgg(
			contextClauses(filters, "municipio"),
			elasticsearch.TermsAgg("localizacao.co_municipio", 1000),
		),
		"regioes": elasticsearch.FilteredAgg(
			contextClauses(filters, "regiao"),
			elasticsearch.TermsAgg(regiaoField, 10),
		),
		"organizacoes": elasticsearch.FilteredAgg(
			contextClauses(filters, "organizacao"),
			elasticsearch.TermsAgg(organizacaoField, 20),
		),
		"categorias": elasticsearch.FilteredAgg(
			contextClauses(filters, "categoria"),
			elasticsearch.CategoriasAgg(categoriaField),
		),
	}
}

// parseAggregations converte o bloco de agregações do ES em buckets.
func parseAggregations(raw map[string]json.RawMessage) *SearchAggregations {
	if len(raw) == 0 {
		return nil
	}

	return &SearchAggregations{
		UFs:          elasticsearch.ParseFilteredBuckets(raw, "ufs"),
		Municipios:   elasticsearch.ParseFilteredBuckets(raw, "municipios"),
		Regioes:      elasticsearch.ParseFilteredBuckets(raw, "regioes"),
		Categorias:   elasticsearch.ParseFilteredBuckets(raw, "categorias"),
		Organizacoes: elasticsearch.ParseFilteredBuckets(raw, "organizacoes"),
	}
}

// Search executa a busca de IES com filtros cumulativos, ordenação e agregações.
func (r *ElasticsearchRepository) Search(
	ctx context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*SearchResult, error) {
	esQuery := elasticsearch.SearchBody(
		buildTextQuery(query),
		buildFilterClauses(filters),
		buildSortClauses(filters.Sort),
		buildAggregations(filters),
		page, limit,
	)

	resp, err := elasticsearch.ExecuteSearch[IES](ctx, r.client, r.index, esQuery)
	if err != nil {
		return nil, err
	}

	return &SearchResult{
		Total:        resp.Total,
		Hits:         resp.Hits,
		Aggregations: parseAggregations(resp.Aggregations),
	}, nil
}

// GetByID busca uma IES pelo seu co_ies (que também é o _id do documento).
func (r *ElasticsearchRepository) GetByID(ctx context.Context, coIES string) (*IES, error) {
	return elasticsearch.GetByID[IES](ctx, r.client, r.index, coIES, "ies", ErrNotFound)
}
