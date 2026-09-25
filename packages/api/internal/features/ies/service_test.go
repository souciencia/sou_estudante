package ies

import (
	"context"
	"errors"
	"testing"
)

// MockRepository implementa Repository para os testes do service.
type MockRepository struct {
	CapturedQuery   string
	CapturedFilters SearchFilterParams
	CapturedPage    int
	CapturedLimit   int
	ReturnResult    *SearchResult
	ReturnSearchErr error

	CapturedID   string
	ReturnIES    *IES
	ReturnGetErr error
}

func (m *MockRepository) Search(
	_ context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*SearchResult, error) {
	m.CapturedQuery = query
	m.CapturedFilters = filters
	m.CapturedPage = page
	m.CapturedLimit = limit
	return m.ReturnResult, m.ReturnSearchErr
}

func (m *MockRepository) GetByID(_ context.Context, coIES string) (*IES, error) {
	m.CapturedID = coIES
	return m.ReturnIES, m.ReturnGetErr
}

func TestBuscarIESAplicaDefaultsDePaginacao(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{Total: 0, Hits: []map[string]interface{}{}},
	}
	service := NewService(mockRepo)

	resp, err := service.BuscarIES(context.Background(), "", SearchFilterParams{}, 0, 0)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if mockRepo.CapturedPage != 1 {
		t.Errorf("esperado page 1, recebido %d", mockRepo.CapturedPage)
	}
	if mockRepo.CapturedLimit != defaultPageSize {
		t.Errorf("esperado limit padrão %d, recebido %d", defaultPageSize, mockRepo.CapturedLimit)
	}
	if resp.Page != 1 || resp.Limit != defaultPageSize {
		t.Errorf("resposta com page/limit incorretos: %+v", resp)
	}
}

func TestBuscarIESRepassaFiltrosEQuery(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{Total: 0, Hits: []map[string]interface{}{}},
	}
	service := NewService(mockRepo)

	filters := SearchFilterParams{
		UF:          []string{"SP", "RJ"},
		Regiao:      []string{"Sudeste"},
		Categoria:   []string{"Federal"},
		Organizacao: []string{"Universidade"},
		Sort:        "relevancia",
	}

	if _, err := service.BuscarIES(context.Background(), "federal", filters, 2, 10); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if mockRepo.CapturedQuery != "federal" {
		t.Errorf("esperado query 'federal', recebido '%s'", mockRepo.CapturedQuery)
	}
	if len(mockRepo.CapturedFilters.UF) != 2 || mockRepo.CapturedFilters.UF[0] != "SP" {
		t.Errorf("filtro UF não repassado: %v", mockRepo.CapturedFilters.UF)
	}
	if mockRepo.CapturedFilters.Sort != "relevancia" {
		t.Errorf("esperado sort 'relevancia', recebido '%s'", mockRepo.CapturedFilters.Sort)
	}
}

func TestBuscarIESMapeiaHitsParaIES(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{
			Total: 1,
			Hits: []map[string]interface{}{
				{
					"co_ies": "376",
					"no_ies": "CENTRO UNIVERSITÁRIO ANHANGUERA DE SÃO PAULO",
					"uf":     "SP",
				},
			},
		},
	}
	service := NewService(mockRepo)

	resp, err := service.BuscarIES(context.Background(), "", SearchFilterParams{}, 1, 20)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if len(resp.Results) != 1 {
		t.Fatalf("esperado 1 resultado, obtido %d", len(resp.Results))
	}
	if resp.Results[0].CoIES != "376" || resp.Results[0].UF != "SP" {
		t.Errorf("hit mapeado incorretamente: %+v", resp.Results[0])
	}
}

func TestBuscarIESRetornaAgregacoes(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{
			Total: 10,
			Hits:  []map[string]interface{}{},
			Aggregations: &SearchAggregations{
				UFs: []AggregationBucket{{Key: "SP", Count: 7}},
			},
		},
	}
	service := NewService(mockRepo)

	resp, err := service.BuscarIES(context.Background(), "", SearchFilterParams{}, 1, 20)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if resp.Aggregations == nil || len(resp.Aggregations.UFs) != 1 || resp.Aggregations.UFs[0].Key != "SP" {
		t.Errorf("agregações não repassadas: %+v", resp.Aggregations)
	}
}

func TestBuscarIESPorIDRejeitaCoIESVazio(t *testing.T) {
	service := NewService(&MockRepository{})

	if _, err := service.BuscarIESPorID(context.Background(), "   "); err == nil {
		t.Fatal("esperado erro para co_ies vazio")
	}
}

func TestBuscarIESPorIDPropagaNaoEncontrado(t *testing.T) {
	mockRepo := &MockRepository{ReturnGetErr: ErrNotFound}
	service := NewService(mockRepo)

	_, err := service.BuscarIESPorID(context.Background(), "999")
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("esperado ErrNotFound, recebido %v", err)
	}
}

func TestBuscarIESPorIDRetornaIES(t *testing.T) {
	mockRepo := &MockRepository{ReturnIES: &IES{CoIES: "376", UF: "SP"}}
	service := NewService(mockRepo)

	item, err := service.BuscarIESPorID(context.Background(), "376")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if item == nil || item.CoIES != "376" {
		t.Errorf("IES retornada incorretamente: %+v", item)
	}
	if mockRepo.CapturedID != "376" {
		t.Errorf("esperado co_ies '376', recebido '%s'", mockRepo.CapturedID)
	}
}
