package ies

import (
	"context"
	"errors"
	"net/url"
	"testing"

	"api_estudante/internal/apperr"
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
		ReturnResult: &SearchResult{Total: 0, Hits: []IES{}},
	}
	service := NewService(mockRepo)

	resp, err := service.BuscarIES(context.Background(), "federal", SearchFilterParams{}, 0, 0)
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
		ReturnResult: &SearchResult{Total: 0, Hits: []IES{}},
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

func TestBuscarIESRepassaHitsTipados(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{
			Total: 1,
			Hits: []IES{
				{
					CoIES: "376",
					NoIES: "CENTRO UNIVERSITÁRIO ANHANGUERA DE SÃO PAULO",
					UF:    "SP",
				},
			},
		},
	}
	service := NewService(mockRepo)

	resp, err := service.BuscarIES(context.Background(), "federal", SearchFilterParams{}, 1, 20)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if len(resp.Results) != 1 {
		t.Fatalf("esperado 1 resultado, obtido %d", len(resp.Results))
	}
	if resp.Results[0].CoIES != "376" || resp.Results[0].UF != "SP" {
		t.Errorf("hit repassado incorretamente: %+v", resp.Results[0])
	}
}

func TestBuscarIESRetornaAgregacoes(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{
			Total: 10,
			Hits:  []IES{},
			Aggregations: &SearchAggregations{
				UFs: []AggregationBucket{{Key: "SP", Count: 7}},
			},
		},
	}
	service := NewService(mockRepo)

	resp, err := service.BuscarIES(context.Background(), "federal", SearchFilterParams{}, 1, 20)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if resp.Aggregations == nil || len(resp.Aggregations.UFs) != 1 || resp.Aggregations.UFs[0].Key != "SP" {
		t.Errorf("agregações não repassadas: %+v", resp.Aggregations)
	}
}

func TestBuscarIESPorIDRejeitaCoIESVazio(t *testing.T) {
	service := NewService(&MockRepository{})

	if _, err := service.BuscarIESPorID(context.Background(), "   "); !errors.Is(err, apperr.ErrInvalidInput) {
		t.Fatalf("esperado ErrInvalidInput, recebido %v", err)
	}
}

func TestBuscarIESRejeitaQueryVazia(t *testing.T) {
	service := NewService(&MockRepository{})

	if _, err := service.BuscarIES(context.Background(), "   ", SearchFilterParams{}, 1, 20); !errors.Is(err, apperr.ErrInvalidInput) {
		t.Fatalf("esperado ErrInvalidInput, recebido %v", err)
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

func TestBuscarIESPropagaErroDoRepository(t *testing.T) {
	origem := errors.New("indisponível")
	mockRepo := &MockRepository{ReturnSearchErr: origem}
	service := NewService(mockRepo)

	_, err := service.BuscarIES(context.Background(), "federal", SearchFilterParams{}, 1, 20)
	if err == nil || !errors.Is(err, origem) {
		t.Fatalf("esperado erro embrulhado do repository, obtido %v", err)
	}
}

func TestBuscarIESPorIDPropagaErroGenerico(t *testing.T) {
	origem := errors.New("indisponível")
	mockRepo := &MockRepository{ReturnGetErr: origem}
	service := NewService(mockRepo)

	_, err := service.BuscarIESPorID(context.Background(), "376")
	if err == nil || !errors.Is(err, origem) {
		t.Fatalf("esperado erro embrulhado, obtido %v", err)
	}
}

func TestBuscarIESPreservaFiltrosNosLinks(t *testing.T) {
	mockRepo := &MockRepository{ReturnResult: &SearchResult{Total: 0, Hits: []IES{}}}
	service := NewService(mockRepo)

	filters := SearchFilterParams{
		UF:          []string{"SP", "RJ"},
		Regiao:      []string{"Sudeste"},
		Categoria:   []string{"Federal"},
		Organizacao: []string{"Universidade"},
		Sort:        "az",
	}

	resp, err := service.BuscarIES(context.Background(), "federal", filters, 2, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	parsed, err := url.Parse(resp.Links.Self)
	if err != nil {
		t.Fatalf("link Self inválido %q: %v", resp.Links.Self, err)
	}
	query := parsed.Query()
	want := map[string]string{
		"q":           "federal",
		"uf":          "SP,RJ",
		"regiao":      "Sudeste",
		"categoria":   "Federal",
		"organizacao": "Universidade",
		"sort":        "az",
		"page":        "2",
		"limit":       "10",
	}
	for key, value := range want {
		if got := query.Get(key); got != value {
			t.Errorf("link Self %s = %q, esperado %q", key, got, value)
		}
	}
}
