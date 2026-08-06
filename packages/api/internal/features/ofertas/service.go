package ofertas

import (
	"context"
	"encoding/json"
	"fmt"
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

	// 4. Montar response
	return &ListResponse{
		Total:   result.Total,
		Page:    page,
		Limit:   limit,
		Results: items,
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
