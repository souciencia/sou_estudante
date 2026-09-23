package ies

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
type AggregationBucket struct {
	Key   string `json:"key"`
	Count int    `json:"count"`
}

// SearchAggregations mapeia as agregações por grupo de filtro.
type SearchAggregations struct {
	UFs          []AggregationBucket `json:"ufs,omitempty"`
	Regioes      []AggregationBucket `json:"regioes,omitempty"`
	Categorias   []AggregationBucket `json:"categorias,omitempty"`
	Organizacoes []AggregationBucket `json:"organizacoes,omitempty"`
}

// PaginationLinks contém URLs HATEOAS para navegação de páginas.
type PaginationLinks struct {
	Self  string  `json:"self"`
	First string  `json:"first"`
	Prev  *string `json:"prev,omitempty"`
	Next  *string `json:"next,omitempty"`
	Last  string  `json:"last"`
}

// IESListResponse é a resposta paginada de busca de IES.
type IESListResponse struct {
	Total        int                 `json:"total"`
	Page         int                 `json:"page"`
	Limit        int                 `json:"limit"`
	Results      []IES               `json:"results"`
	Links        PaginationLinks     `json:"links"`
	Aggregations *SearchAggregations `json:"aggregations,omitempty"`
}
