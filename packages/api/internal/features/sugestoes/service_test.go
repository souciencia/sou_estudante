package sugestoes

import (
	"context"
	"testing"
)

// MockRepository implementa Repository para testes do service
type MockRepository struct {
	CapturedTermo   string
	CapturedLimit   int
	Called          bool
	ReturnSugestoes []string
	ReturnErr       error
}

func (m *MockRepository) BuscarSugestoes(_ context.Context, termo string, limit int) ([]string, error) {
	m.Called = true
	m.CapturedTermo = termo
	m.CapturedLimit = limit
	return m.ReturnSugestoes, m.ReturnErr
}

func TestSugerirCursosRepassaTermoComLimitePadrao(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnSugestoes: []string{"MEDICINA", "MEDICINA VETERINÁRIA"},
	}
	service := NewService(mockRepo)
	ctx := context.Background()

	result, err := service.SugerirCursos(ctx, "medicina", 0)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if !mockRepo.Called {
		t.Fatal("esperado repositório chamado")
	}
	if mockRepo.CapturedTermo != "medicina" {
		t.Errorf("esperado termo 'medicina' no repositório, recebido '%s'", mockRepo.CapturedTermo)
	}
	if mockRepo.CapturedLimit != defaultSugestoesLimit {
		t.Errorf("esperado limit padrão %d no repositório, recebido %d", defaultSugestoesLimit, mockRepo.CapturedLimit)
	}
	if len(result) != 2 || result[0] != "MEDICINA" || result[1] != "MEDICINA VETERINÁRIA" {
		t.Errorf("esperado repasse das sugestões, recebido %v", result)
	}
}

func TestSugerirCursosLimitaLimiteSuperior(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnSugestoes: []string{},
	}
	service := NewService(mockRepo)
	ctx := context.Background()

	if _, err := service.SugerirCursos(ctx, "medicina", 999); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if mockRepo.CapturedLimit != maxSugestoesLimit {
		t.Errorf("esperado limit máximo %d no repositório, recebido %d", maxSugestoesLimit, mockRepo.CapturedLimit)
	}
}

func TestSugerirCursosRetornaVazioParaTermoCurto(t *testing.T) {
	mockRepo := &MockRepository{}
	service := NewService(mockRepo)
	ctx := context.Background()

	result, err := service.SugerirCursos(ctx, "a", 8)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if mockRepo.Called {
		t.Error("repositório não deveria ser chamado para termo curto")
	}
	if len(result) != 0 {
		t.Errorf("esperado lista vazia para termo curto, recebido %v", result)
	}
}

func TestSugerirCursosNormalizaTermo(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnSugestoes: []string{},
	}
	service := NewService(mockRepo)
	ctx := context.Background()

	if _, err := service.SugerirCursos(ctx, "  medicina  ", 8); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if mockRepo.CapturedTermo != "medicina" {
		t.Errorf("esperado termo sem espaços 'medicina', recebido '%s'", mockRepo.CapturedTermo)
	}
}
