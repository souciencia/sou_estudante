package ies

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
)

// Regras de paginação da busca de IES.
const (
	defaultPageSize = 20
	maxPageSize     = 100
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

	items := make([]IES, 0, len(result.Hits))
	for _, hit := range result.Hits {
		item, err := transformHitToIES(hit)
		if err != nil {
			continue
		}
		items = append(items, item)
	}

	return &IESListResponse{
		Total:        result.Total,
		Page:         page,
		Limit:        limit,
		Results:      items,
		Links:        buildPaginationLinks(query, filters, page, limit, result.Total),
		Aggregations: result.Aggregations,
	}, nil
}

// BuscarIESPorID retorna uma IES específica pelo co_ies.
func (s *ServiceImpl) BuscarIESPorID(ctx context.Context, coIES string) (*IES, error) {
	coIES = strings.TrimSpace(coIES)
	if coIES == "" {
		return nil, fmt.Errorf("co_ies não pode ser vazio")
	}

	item, err := s.Repository.GetByID(ctx, coIES)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar ies: %w", err)
	}
	return item, nil
}

// transformHitToIES converte um documento do ES em IES via JSON.
func transformHitToIES(hit map[string]interface{}) (IES, error) {
	jsonBytes, err := json.Marshal(hit)
	if err != nil {
		return IES{}, fmt.Errorf("erro ao serializar hit: %w", err)
	}

	var item IES
	if err := json.Unmarshal(jsonBytes, &item); err != nil {
		return IES{}, fmt.Errorf("erro ao deserializar para IES: %w", err)
	}
	return item, nil
}

// buildPaginationLinks gera links HATEOAS preservando os filtros aplicados.
func buildPaginationLinks(query string, filters SearchFilterParams, page, limit, total int) PaginationLinks {
	lastPage := (total + limit - 1) / limit
	if lastPage < 1 {
		lastPage = 1
	}

	buildURL := func(p int) string {
		values := url.Values{}
		if query != "" {
			values.Set("q", query)
		}
		values.Set("page", fmt.Sprintf("%d", p))
		values.Set("limit", fmt.Sprintf("%d", limit))

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

		return fmt.Sprintf("/ies?%s", values.Encode())
	}

	links := PaginationLinks{
		Self:  buildURL(page),
		First: buildURL(1),
		Last:  buildURL(lastPage),
	}

	if page > 1 {
		prevURL := buildURL(page - 1)
		links.Prev = &prevURL
	}
	if page < lastPage {
		nextURL := buildURL(page + 1)
		links.Next = &nextURL
	}

	return links
}
