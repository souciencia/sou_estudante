package cursos

import (
	"context"
	"fmt"
	"net/url"
	"regexp"
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
	if !validSort(filters.Sort) {
		return nil, fmt.Errorf("%w: sort inválido %q (use enade, desistencia, az ou relevancia)", apperr.ErrInvalidInput, filters.Sort)
	}
	page, limit = httpx.NormalizePagination(page, limit)

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
	// O _id do curso é o seu sequencial (numérico). Rejeitar o resto evita
	// montar o caminho da requisição ao Elasticsearch com texto arbitrário.
	if !numericID.MatchString(id) {
		return nil, fmt.Errorf("%w: id deve ser numérico", apperr.ErrInvalidInput)
	}

	item, err := s.Repository.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar curso: %w", err)
	}
	return item, nil
}

var numericID = regexp.MustCompile(`^[0-9]+$`)

// validSort informa se o critério de ordenação é conhecido. Vazio, "_score" e
// "relevancia" significam relevância (padrão).
func validSort(sort string) bool {
	switch sort {
	case "", "_score", "relevancia", "enade", "desistencia", "az":
		return true
	}
	return false
}

// cursosFilterValues serializa os filtros aplicados para preservá-los nos
// links de paginação HATEOAS.
func cursosFilterValues(query string, filters SearchFilterParams) url.Values {
	values := url.Values{}
	values.Set("q", query)
	httpx.SetCSV(values, "uf", filters.UF)
	httpx.SetCSV(values, "turno", filters.Turno)
	httpx.SetCSV(values, "grau", filters.Grau)
	httpx.SetCSV(values, "categoria", filters.Categoria)
	httpx.SetCSV(values, "modalidade", filters.Modalidade)
	httpx.SetCSV(values, "enade", filters.Enade)
	httpx.SetCSV(values, "ingresso", filters.Ingresso)
	if filters.Sort != "" {
		values.Set("sort", filters.Sort)
	}
	// exact é ligado por padrão: só o valor desligado precisa ser preservado.
	if !filters.Exact {
		values.Set("exact", "false")
	}
	return values
}
