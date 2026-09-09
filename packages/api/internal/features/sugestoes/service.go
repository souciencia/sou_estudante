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
	defaultSugestoesLimit  = 8
	maxSugestoesLimit      = 20
)

// Service define o contrato de negócio para sugestões de cursos
type Service interface {
	SugerirCursos(ctx context.Context, termo string, limit int) ([]string, error)
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

// SugerirCursos valida o termo e o limite e delega a busca ao repositório
func (s *ServiceImpl) SugerirCursos(ctx context.Context, termo string, limit int) ([]string, error) {
	termo = strings.TrimSpace(termo)

	// Termos muito curtos geram ruído; retorna lista vazia sem consultar o índice
	if utf8.RuneCountInString(termo) < minSugestoesTermoRunes {
		return []string{}, nil
	}

	if limit < 1 {
		limit = defaultSugestoesLimit
	}
	if limit > maxSugestoesLimit {
		limit = maxSugestoesLimit
	}

	sugestoes, err := s.Repository.BuscarSugestoes(ctx, termo, limit)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar sugestões: %w", err)
	}

	// Garantir slice não-nulo para serializar como [] e não null
	if sugestoes == nil {
		return []string{}, nil
	}
	return sugestoes, nil
}
