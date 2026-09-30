package ies

import (
	"api_estudante/internal/elasticsearch"
	"api_estudante/internal/httpx"
)

// IES representa uma Instituição de Educação Superior no índice "ies".
// O _id do documento é o próprio co_ies.
type IES struct {
	CoIES                   string `json:"co_ies,omitempty"`
	NoIES                   string `json:"no_ies,omitempty"`
	SgIES                   string `json:"sg_ies,omitempty"`
	CategoriaAdministrativa string `json:"categoria_administrativa,omitempty"`
	OrganizacaoAcademica    string `json:"organizacao_academica,omitempty"`
	Municipio               string `json:"municipio,omitempty"`
	UF                      string `json:"uf,omitempty"`
	Regiao                  string `json:"regiao,omitempty"`
}

// SearchFilterParams contém parâmetros opcionais de filtragem e ordenação.
type SearchFilterParams struct {
	UF          []string `json:"uf,omitempty"`
	Regiao      []string `json:"regiao,omitempty"`
	Categoria   []string `json:"categoria,omitempty"`
	Organizacao []string `json:"organizacao,omitempty"`
	Sort        string   `json:"sort,omitempty"`
}

// AggregationBucket representa um item de contagem de uma agregação.
// Aliás do tipo compartilhado, mantido para preservar a API do pacote.
type AggregationBucket = elasticsearch.AggregationBucket

// SearchAggregations mapeia as agregações por grupo de filtro.
type SearchAggregations struct {
	UFs          []AggregationBucket `json:"ufs,omitempty"`
	Regioes      []AggregationBucket `json:"regioes,omitempty"`
	Categorias   []AggregationBucket `json:"categorias,omitempty"`
	Organizacoes []AggregationBucket `json:"organizacoes,omitempty"`
}

// PaginationLinks contém URLs HATEOAS para navegação de páginas.
// Aliás do tipo compartilhado, mantido para preservar a API do pacote.
type PaginationLinks = httpx.PaginationLinks

// IESListResponse é a resposta paginada de busca de IES.
type IESListResponse struct {
	Total        int                 `json:"total"`
	Page         int                 `json:"page"`
	Limit        int                 `json:"limit"`
	Results      []IES               `json:"results"`
	Links        PaginationLinks     `json:"links"`
	Aggregations *SearchAggregations `json:"aggregations,omitempty"`
}
