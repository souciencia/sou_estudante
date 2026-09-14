package cursos

import cursodoc "shared/cursos"

// SearchFilterParams contém parâmetros opcionais de filtragem e ordenação
type SearchFilterParams struct {
	UF         []string `json:"uf,omitempty"`
	Turno      []string `json:"turno,omitempty"`
	Grau       []string `json:"grau,omitempty"`
	Categoria  []string `json:"categoria,omitempty"`
	Modalidade []string `json:"modalidade,omitempty"`
	Enade      []string `json:"enade,omitempty"`
	Sort       string   `json:"sort,omitempty"`
	Exact      bool     `json:"exact,omitempty"`
}

// AggregationBucket representa um item de contagem de uma agregação
type AggregationBucket struct {
	Key   string `json:"key"`
	Count int    `json:"count"`
}

// SearchAggregations mapeia as agregações por grupo de filtro
type SearchAggregations struct {
	UFs         []AggregationBucket `json:"ufs,omitempty"`
	Turnos      []AggregationBucket `json:"turnos,omitempty"`
	Graus       []AggregationBucket `json:"graus,omitempty"`
	Categorias  []AggregationBucket `json:"categorias,omitempty"`
	Modalidades []AggregationBucket `json:"modalidades,omitempty"`
	Enades      []AggregationBucket `json:"enades,omitempty"`
}

// CursoListResponse é a resposta paginada de busca de cursos
type CursoListResponse struct {
	Total        int                 `json:"total"`
	Page         int                 `json:"page"`
	Limit        int                 `json:"limit"`
	Results      []Curso             `json:"results"`
	Links        PaginationLinks     `json:"links"`
	Aggregations *SearchAggregations `json:"aggregations,omitempty"`
}

// PaginationLinks contém URLs HATEOAS para navegação de páginas
type PaginationLinks struct {
	Self  string  `json:"self"`
	First string  `json:"first"`
	Prev  *string `json:"prev,omitempty"`
	Next  *string `json:"next,omitempty"`
	Last  string  `json:"last"`
}

// Curso é o documento (source) do índice de cursos, definido em
// packages/shared/cursos e compartilhado com o bulker.
type Curso = cursodoc.Document
