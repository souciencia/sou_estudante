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

func TestBuscarCursosComFiltrosCumulativos(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{
			Total: 25,
			Hits:  []map[string]interface{}{},
		},
	}

	service := NewService(mockRepo)
	ctx := context.Background()

	filters := SearchFilterParams{
		UF:         []string{"SP", "RJ"},
		Turno:      []string{"Noturno", "Diurno"},
		Grau:       []string{"Bacharelado"},
		Categoria:  []string{"Federal"},
		Modalidade: []string{"Presencial"},
		Enade:      []string{"5", "4"},
		Sort:       "enade",
	}

	resp, err := service.BuscarCursos(ctx, "engenharia", filters, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if len(mockRepo.CapturedFilters.UF) != 2 || mockRepo.CapturedFilters.UF[0] != "SP" || mockRepo.CapturedFilters.UF[1] != "RJ" {
		t.Errorf("esperado UF ['SP', 'RJ'], recebido '%v'", mockRepo.CapturedFilters.UF)
	}
	if len(mockRepo.CapturedFilters.Turno) != 2 {
		t.Errorf("esperado 2 turnos, recebido '%v'", mockRepo.CapturedFilters.Turno)
	}

	// Verificar se os links HATEOAS contêm múltiplos valores preservados
	if !strings.Contains(resp.Links.Self, "uf=SP%2CRJ") && !strings.Contains(resp.Links.Self, "uf=SP,RJ") && !strings.Contains(resp.Links.Self, "uf=SP") {
		t.Errorf("link Self deveria conter parâmetros de UF, obtido: %s", resp.Links.Self)
	}
}

func TestBuscarCursosRetornaAgregacoes(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{
			Total: 10,
			Hits:  []map[string]interface{}{},
			Aggregations: &SearchAggregations{
				UFs: []AggregationBucket{
					{Key: "SP", Count: 7},
					{Key: "RJ", Count: 3},
				},
				Graus: []AggregationBucket{
					{Key: "BACHARELADO", Count: 10},
				},
			},
		},
	}

	service := NewService(mockRepo)
	ctx := context.Background()

	resp, err := service.BuscarCursos(ctx, "medicina", SearchFilterParams{}, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if resp.Aggregations == nil {
		t.Fatal("esperado aggregations preenchido, recebido nil")
	}
	if len(resp.Aggregations.UFs) != 2 || resp.Aggregations.UFs[0].Key != "SP" || resp.Aggregations.UFs[0].Count != 7 {
		t.Errorf("agregacao de UF incorreta: %v", resp.Aggregations.UFs)
	}
}
