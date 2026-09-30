package ies

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"api_estudante/internal/apperr"
	"api_estudante/internal/httpx"
)

// Regras de paginação da busca de IES.
const (
	defaultPageSize = httpx.DefaultPageSize
	maxPageSize     = httpx.MaxPageSize
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
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > maxPageSize {
		limit = defaultPageSize
	}

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

// BuscarIESPorID retorna uma IES específica pelo co_ies.
func (s *ServiceImpl) BuscarIESPorID(ctx context.Context, coIES string) (*IES, error) {
	coIES = strings.TrimSpace(coIES)
	if coIES == "" {
		return nil, fmt.Errorf("%w: co_ies não pode ser vazio", apperr.ErrInvalidInput)
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
	if len(filters.UF) > 0 {
		values.Set("uf", strings.Join(filters.UF, ","))
	}
	if len(filters.Regiao) > 0 {
		values.Set("regiao", strings.Join(filters.Regiao, ","))
	}
	if len(filters.Categoria) > 0 {
		values.Set("categoria", strings.Join(filters.Categoria, ","))
	}
	if len(filters.Organizacao) > 0 {
		values.Set("organizacao", strings.Join(filters.Organizacao, ","))
	}
	if filters.Sort != "" {
		values.Set("sort", filters.Sort)
	}
	return values
}
