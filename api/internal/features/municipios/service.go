package municipios

import (
	"context"
	"fmt"
)

// Service define o contrato de negócio para os municípios por UF.
type Service interface {
	ListarMunicipios(ctx context.Context) (Response, error)
}

// ServiceImpl implementa Service com validação e transformação.
type ServiceImpl struct {
	Repository Repository
}

// NewService cria uma nova instância do service.
func NewService(repo Repository) Service {
	return &ServiceImpl{Repository: repo}
}

// ListarMunicipios devolve os municípios por UF, garantindo um mapa não-nulo.
func (s *ServiceImpl) ListarMunicipios(ctx context.Context) (Response, error) {
	result, err := s.Repository.Listar(ctx)
	if err != nil {
		return nil, fmt.Errorf("erro ao listar municípios: %w", err)
	}
	if result == nil {
		return Response{}, nil
	}
	return result, nil
}
