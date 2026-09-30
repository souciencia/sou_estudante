package cursos

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"api_estudante/internal/apperr"
	"api_estudante/internal/httpx"
)

// Service define a interface de negócio para cursos
type Service interface {
	BuscarCursos(ctx context.Context, query string, filters SearchFilterParams, page, limit int) (*CursoListResponse, error)
	BuscarCursoPorID(ctx context.Context, id string) (*Curso, error)
}

// ServiceImpl implementa Service com validação e transformação
type ServiceImpl struct {
	Repository Repository
}

// NewService cria uma nova instância do service
func NewService(repo Repository) Service {
	return &ServiceImpl{
		Repository: repo,
	}
}

// BuscarCursos orquestra busca de cursos com validação e transformação
func (s *ServiceImpl) BuscarCursos(
	ctx context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*CursoListResponse, error) {
	query = strings.TrimSpace(query)
	if query == "" {
		return nil, fmt.Errorf("%w: query não pode ser vazio", apperr.ErrInvalidInput)
	}
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > httpx.MaxPageSize {
		limit = httpx.DefaultPageSize
	}

	result, err := s.Repository.Search(ctx, query, filters, page, limit)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar cursos: %w", err)
	}

	return &CursoListResponse{
		Total:        result.Total,
		Page:         page,
		Limit:        limit,
		Results:      result.Hits,
		Links:        httpx.BuildPaginationLinks("/cursos", cursosFilterValues(query, filters), page, limit, result.Total),
		Aggregations: result.Aggregations,
	}, nil
}

// BuscarCursoPorID retorna um curso específico pelo seu sequencial.
func (s *ServiceImpl) BuscarCursoPorID(ctx context.Context, id string) (*Curso, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, fmt.Errorf("%w: id não pode ser vazio", apperr.ErrInvalidInput)
	}

	item, err := s.Repository.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar curso: %w", err)
	}
	return item, nil
}

// cursosFilterValues serializa os filtros aplicados para preservá-los nos
// links de paginação HATEOAS.
func cursosFilterValues(query string, filters SearchFilterParams) url.Values {
	values := url.Values{}
	values.Set("q", query)
	if len(filters.UF) > 0 {
		values.Set("uf", strings.Join(filters.UF, ","))
	}
	if len(filters.Turno) > 0 {
		values.Set("turno", strings.Join(filters.Turno, ","))
	}
	if len(filters.Grau) > 0 {
		values.Set("grau", strings.Join(filters.Grau, ","))
	}
	if len(filters.Categoria) > 0 {
		values.Set("categoria", strings.Join(filters.Categoria, ","))
	}
	if len(filters.Modalidade) > 0 {
		values.Set("modalidade", strings.Join(filters.Modalidade, ","))
	}
	if len(filters.Enade) > 0 {
		values.Set("enade", strings.Join(filters.Enade, ","))
	}
	if filters.Sort != "" {
		values.Set("sort", filters.Sort)
	}
	return values
}
