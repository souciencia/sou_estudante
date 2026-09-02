package cursos

import (
	"context"
	"strings"
	"testing"
)

// MockRepository implementa Repository para testes
type MockRepository struct {
	CapturedQuery   string
	CapturedFilters SearchFilterParams
	CapturedPage    int
	CapturedLimit   int
	ReturnResult    *SearchResult
	ReturnErr       error
}

func (m *MockRepository) Search(
	ctx context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*SearchResult, error) {
	m.CapturedQuery = query
	m.CapturedFilters = filters
	m.CapturedPage = page
	m.CapturedLimit = limit
	return m.ReturnResult, m.ReturnErr
}

func TestBuscarCursosComFiltros(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{
			Total: 25,
			Hits:  []map[string]interface{}{},
		},
	}

	service := NewService(mockRepo)
	ctx := context.Background()

	filters := SearchFilterParams{
		UF:         "SP",
		Turno:      "Noturno",
		Grau:       "Bacharelado",
		Categoria:  "Federal",
		Modalidade: "Presencial",
		Enade:      "5",
		Sort:       "enade",
	}

	resp, err := service.BuscarCursos(ctx, "engenharia", filters, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if mockRepo.CapturedFilters.UF != "SP" {
		t.Errorf("esperado UF 'SP', recebido '%s'", mockRepo.CapturedFilters.UF)
	}
	if mockRepo.CapturedFilters.Turno != "Noturno" {
		t.Errorf("esperado Turno 'Noturno', recebido '%s'", mockRepo.CapturedFilters.Turno)
	}

	// Verificar se os links HATEOAS contêm os parâmetros de filtro
	if !strings.Contains(resp.Links.Self, "uf=SP") {
		t.Errorf("link Self deveria conter 'uf=SP', obtido: %s", resp.Links.Self)
	}
	if !strings.Contains(resp.Links.Self, "turno=Noturno") {
		t.Errorf("link Self deveria conter 'turno=Noturno', obtido: %s", resp.Links.Self)
	}

	nextURL := ""
	if resp.Links.Next != nil {
		nextURL = *resp.Links.Next
	}
	if !strings.Contains(nextURL, "uf=SP") {
		t.Errorf("link Next deveria conter 'uf=SP'")
	}
}
