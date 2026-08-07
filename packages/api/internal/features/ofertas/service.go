package ofertas

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
)

// Service define a interface de negócio para ofertas
type Service interface {
	BuscarOfertas(ctx context.Context, query string, page, limit int) (*ListResponse, error)
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

// BuscarOfertas orquestra busca de ofertas com validação e transformação
func (s *ServiceImpl) BuscarOfertas(
	ctx context.Context,
	query string,
	page, limit int,
) (*ListResponse, error) {
	// 1. Validar parâmetros
	if query == "" {
		return nil, fmt.Errorf("query não pode ser vazio")
	}
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20 // default
	}

	// 2. Buscar no repositório
	result, err := s.Repository.Search(ctx, query, page, limit)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar ofertas: %w", err)
	}

	// 3. Transformar hits em Oferta
	items := make([]Oferta, 0, len(result.Hits))
	for _, hit := range result.Hits {
		item, err := transformHitToOferta(hit)
		if err != nil {
			// Log do erro mas continua processando
			continue
		}
		items = append(items, item)
	}

	// 4. Gerar links de paginação
	links := buildPaginationLinks(query, page, limit, result.Total)

	// 5. Montar response
	return &ListResponse{
		Total:   result.Total,
		Page:    page,
		Limit:   limit,
		Results: items,
		Links:   links,
	}, nil
}

// transformHitToOferta converte documento ES em Oferta usando JSON marshaling
func transformHitToOferta(hit map[string]interface{}) (Oferta, error) {
	// Converter map para JSON e depois para struct
	// Isso garante que todos os campos nested sejam mapeados corretamente
	jsonBytes, err := json.Marshal(hit)
	if err != nil {
		return Oferta{}, fmt.Errorf("erro ao serializar hit: %w", err)
	}

	var oferta Oferta
	if err := json.Unmarshal(jsonBytes, &oferta); err != nil {
		return Oferta{}, fmt.Errorf("erro ao deserializar para Oferta: %w", err)
	}

	return oferta, nil
}

// buildPaginationLinks gera links HATEOAS para navegação de páginas
func buildPaginationLinks(query string, page, limit, total int) PaginationLinks {
	// Calcular última página
	lastPage := (total + limit - 1) / limit
	if lastPage < 1 {
		lastPage = 1
	}

	// Função helper para construir URL
	buildURL := func(p int) string {
		return fmt.Sprintf("/ofertas?q=%s&page=%d&limit=%d", 
			url.QueryEscape(query), p, limit)
	}

	links := PaginationLinks{
		Self:  buildURL(page),
		First: buildURL(1),
		Last:  buildURL(lastPage),
	}

	// Adicionar prev se não estamos na primeira página
	if page > 1 {
		prevURL := buildURL(page - 1)
		links.Prev = &prevURL
	}

	// Adicionar next se não estamos na última página
	if page < lastPage {
		nextURL := buildURL(page + 1)
		links.Next = &nextURL
	}

	return links
}
