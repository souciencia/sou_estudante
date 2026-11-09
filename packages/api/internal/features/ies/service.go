package ies

import (
	"context"
	"fmt"
	"net/url"
	"regexp"
	"strings"

	"api_estudante/internal/apperr"
	"api_estudante/internal/httpx"
)

// Service define a interface de negócio para IES.
type Service interface {
	BuscarIES(ctx context.Context, query string, filters SearchFilterParams, page, limit int) (*IESListResponse, error)
	BuscarIESPorID(ctx context.Context, coIES string) (*IES, error)
}

// ServiceImpl implementa Service com validação e transformação.
type ServiceImpl struct {
	Repository Repository
}

// NewService cria uma nova instância do service.
func NewService(repo Repository) Service {
	return &ServiceImpl{Repository: repo}
}

// BuscarIES orquestra a busca de IES com validação, paginação e agregações.
func (s *ServiceImpl) BuscarIES(
	ctx context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*IESListResponse, error) {
	query = strings.TrimSpace(query)
	if query == "" {
		return nil, fmt.Errorf("%w: query não pode ser vazio", apperr.ErrInvalidInput)
	}
	if !validSort(filters.Sort) {
		return nil, fmt.Errorf("%w: sort inválido %q (use az ou relevancia)", apperr.ErrInvalidInput, filters.Sort)
	}
	page, limit = httpx.NormalizePagination(page, limit)

	result, err := s.Repository.Search(ctx, query, filters, page, limit)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar ies: %w", err)
	}

	return &IESListResponse{
		Total:        result.Total,
		Page:         page,
		Limit:        limit,
		Results:      result.Hits,
		Links:        httpx.BuildPaginationLinks("/ies", iesFilterValues(query, filters), page, limit, result.Total),
		Aggregations: result.Aggregations,
	}, nil
}

// validID restringe o co_ies a letras, dígitos, "_" e "-", para que o texto
// do caminho não altere a rota usada na consulta ao Elasticsearch.
var validID = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)

// validSort informa se o critério de ordenação é conhecido. Vazio significa
// o padrão ("az"); "_score" equivale a "relevancia".
func validSort(sort string) bool {
	switch sort {
	case "", "az", "relevancia", "_score":
		return true
	}
	return false
}

// BuscarIESPorID retorna uma IES específica pelo co_ies.
func (s *ServiceImpl) BuscarIESPorID(ctx context.Context, coIES string) (*IES, error) {
	coIES = strings.TrimSpace(coIES)
	if coIES == "" {
		return nil, fmt.Errorf("%w: co_ies não pode ser vazio", apperr.ErrInvalidInput)
	}
	if !validID.MatchString(coIES) {
		return nil, fmt.Errorf("%w: co_ies contém caracteres inválidos", apperr.ErrInvalidInput)
	}

	item, err := s.Repository.GetByID(ctx, coIES)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar ies: %w", err)
	}
	return item, nil
}

// iesFilterValues serializa os filtros aplicados para preservá-los nos links
// de paginação HATEOAS.
func iesFilterValues(query string, filters SearchFilterParams) url.Values {
	values := url.Values{}
	if query != "" {
		values.Set("q", query)
	}
	httpx.SetCSV(values, "uf", filters.UF)
	httpx.SetCSV(values, "municipio", filters.Municipio)
	httpx.SetCSV(values, "regiao", filters.Regiao)
	httpx.SetCSV(values, "categoria", filters.Categoria)
	httpx.SetCSV(values, "organizacao", filters.Organizacao)
	if filters.Sort != "" {
		values.Set("sort", filters.Sort)
	}
	return values
}
