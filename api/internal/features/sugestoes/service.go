package sugestoes

import (
	"context"
	"fmt"
	"strings"
	"unicode/utf8"
)

// Constantes de regras de negócio para sugestões
const (
	minSugestoesTermoRunes = 2
	defaultSugestoesLimit  = 100
)

// Service define o contrato de negócio para sugestões de nomes
type Service interface {
	Sugerir(ctx context.Context, termo string, limit int) ([]Sugestao, error)
}

// ServiceImpl implementa Service com validação e orquestração
type ServiceImpl struct {
	Repository Repository
}

// NewService cria uma nova instância do service
func NewService(repo Repository) Service {
	return &ServiceImpl{
		Repository: repo,
	}
}

// Sugerir valida o termo e o limite e delega a busca ao repositório
func (s *ServiceImpl) Sugerir(ctx context.Context, termo string, limit int) ([]Sugestao, error) {
	termo = strings.TrimSpace(termo)

	// Termos muito curtos geram ruído; retorna lista vazia sem consultar o índice
	if utf8.RuneCountInString(termo) < minSugestoesTermoRunes {
		return []Sugestao{}, nil
	}

	if limit < 1 {
		limit = defaultSugestoesLimit
	}

	sugestoes, err := s.Repository.BuscarSugestoes(ctx, termo, limit)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar sugestões: %w", err)
	}

	// Garantir slice não-nulo para serializar como [] e não null
	if sugestoes == nil {
		return []Sugestao{}, nil
	}
	return sugestoes, nil
}
