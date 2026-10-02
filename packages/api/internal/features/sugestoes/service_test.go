package sugestoes

import (
	"context"
	"errors"
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

	result, err := service.Sugerir(ctx, "medicina", 0)
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

	if _, err := service.Sugerir(ctx, "medicina", 999); err != nil {
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

	result, err := service.Sugerir(ctx, "a", 8)
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

	if _, err := service.Sugerir(ctx, "  medicina  ", 8); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if mockRepo.CapturedTermo != "medicina" {
		t.Errorf("esperado termo sem espaços 'medicina', recebido '%s'", mockRepo.CapturedTermo)
	}
}

// O comprimento mínimo é contado em runes: "á" tem 1 rune (2 bytes) e não deve
// consultar o índice, enquanto "ab" (2 runes) deve.
func TestSugerirAplicaMinimoDeRunes(t *testing.T) {
	casos := []struct {
		termo      string
		wantChamar bool
	}{
		{"", false},
		{"   ", false},
		{"a", false},
		{"á", false},
		{"ab", true},
	}

	for _, caso := range casos {
		t.Run(caso.termo, func(t *testing.T) {
			mockRepo := &MockRepository{ReturnSugestoes: []string{}}
			service := NewService(mockRepo)

			result, err := service.Sugerir(context.Background(), caso.termo, 8)
			if err != nil {
				t.Fatalf("erro inesperado: %v", err)
			}
			if mockRepo.Called != caso.wantChamar {
				t.Errorf("repositório chamado = %v, esperado %v", mockRepo.Called, caso.wantChamar)
			}
			if result == nil {
				t.Error("resultado nunca deveria ser nil")
			}
		})
	}
}

func TestSugerirAplicaLimites(t *testing.T) {
	casos := []struct {
		limit int
		want  int
	}{
		{0, defaultSugestoesLimit},
		{-5, defaultSugestoesLimit},
		{5, 5},
		{999, maxSugestoesLimit},
	}

	for _, caso := range casos {
		mockRepo := &MockRepository{ReturnSugestoes: []string{}}
		service := NewService(mockRepo)

		if _, err := service.Sugerir(context.Background(), "medicina", caso.limit); err != nil {
			t.Fatalf("erro inesperado: %v", err)
		}
		if mockRepo.CapturedLimit != caso.want {
			t.Errorf("limit %d: repositório recebeu %d, esperado %d", caso.limit, mockRepo.CapturedLimit, caso.want)
		}
	}
}

func TestSugerirConverteNilEmSliceVazio(t *testing.T) {
	mockRepo := &MockRepository{ReturnSugestoes: nil}
	service := NewService(mockRepo)

	result, err := service.Sugerir(context.Background(), "medicina", 8)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if result == nil {
		t.Fatal("resultado deveria ser slice vazio, não nil (evita 'null' no JSON)")
	}
	if len(result) != 0 {
		t.Errorf("resultado = %v, esperado vazio", result)
	}
}

func TestSugerirPropagaErroDoRepository(t *testing.T) {
	origem := errors.New("indisponível")
	mockRepo := &MockRepository{ReturnErr: origem}
	service := NewService(mockRepo)

	_, err := service.Sugerir(context.Background(), "medicina", 8)
	if err == nil || !errors.Is(err, origem) {
		t.Fatalf("esperado erro embrulhado, obtido %v", err)
	}
}
