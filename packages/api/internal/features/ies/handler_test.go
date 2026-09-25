package ies

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// MockService implementa Service para os testes de handler.
type MockService struct {
	CapturedQuery   string
	CapturedFilters SearchFilterParams
	CapturedPage    int
	CapturedLimit   int
	ReturnResponse  *IESListResponse
	ReturnErr       error

	CapturedID   string
	ReturnIES    *IES
	ReturnGetErr error
}

func (m *MockService) BuscarIES(
	_ context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*IESListResponse, error) {
	m.CapturedQuery = query
	m.CapturedFilters = filters
	m.CapturedPage = page
	m.CapturedLimit = limit
	return m.ReturnResponse, m.ReturnErr
}

func (m *MockService) BuscarIESPorID(_ context.Context, coIES string) (*IES, error) {
	m.CapturedID = coIES
	return m.ReturnIES, m.ReturnGetErr
}

func TestHandlerRejeitaMetodoNaoGET(t *testing.T) {
	handler := &Handler{Service: &MockService{}}

	req := httptest.NewRequest(http.MethodPost, "/ies?q=federal", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("esperado 405, recebido %d", rec.Code)
	}
}

func TestHandlerAceitaBuscaSemTermo(t *testing.T) {
	mockService := &MockService{
		ReturnResponse: &IESListResponse{Results: []IES{}, Links: PaginationLinks{Self: "/ies"}},
	}
	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/ies", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200 sem q, recebido %d", rec.Code)
	}
	if mockService.CapturedQuery != "" {
		t.Errorf("esperado query vazia, recebido '%s'", mockService.CapturedQuery)
	}
}

func TestHandlerExtraiFiltrosEPaginacao(t *testing.T) {
	mockService := &MockService{
		ReturnResponse: &IESListResponse{Results: []IES{}, Links: PaginationLinks{Self: "/ies"}},
	}
	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(
		http.MethodGet,
		"/ies?q=federal&uf=SP,RJ&regiao=Sudeste&categoria=Federal&organizacao=Universidade&page=2&limit=5&sort=az",
		nil,
	)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200, recebido %d", rec.Code)
	}
	if len(mockService.CapturedFilters.UF) != 2 || mockService.CapturedFilters.UF[1] != "RJ" {
		t.Errorf("UF não extraída: %v", mockService.CapturedFilters.UF)
	}
	if len(mockService.CapturedFilters.Regiao) != 1 || mockService.CapturedFilters.Regiao[0] != "Sudeste" {
		t.Errorf("Regiao não extraída: %v", mockService.CapturedFilters.Regiao)
	}
	if len(mockService.CapturedFilters.Categoria) != 1 || mockService.CapturedFilters.Categoria[0] != "Federal" {
		t.Errorf("Categoria não extraída: %v", mockService.CapturedFilters.Categoria)
	}
	if len(mockService.CapturedFilters.Organizacao) != 1 || mockService.CapturedFilters.Organizacao[0] != "Universidade" {
		t.Errorf("Organizacao não extraída: %v", mockService.CapturedFilters.Organizacao)
	}
	if mockService.CapturedPage != 2 || mockService.CapturedLimit != 5 {
		t.Errorf("paginacão não extraída: page=%d limit=%d", mockService.CapturedPage, mockService.CapturedLimit)
	}
	if mockService.CapturedFilters.Sort != "az" {
		t.Errorf("sort não extraído: %s", mockService.CapturedFilters.Sort)
	}
}

func TestHandlerSerializaRespostaJSON(t *testing.T) {
	mockService := &MockService{
		ReturnResponse: &IESListResponse{
			Total:   1,
			Page:    1,
			Limit:   20,
			Results: []IES{{CoIES: "376", NoIES: "ANHANGUERA", UF: "SP"}},
			Links:   PaginationLinks{Self: "/ies?page=1&limit=20"},
		},
	}
	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/ies", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Header().Get("Content-Type") != "application/json" {
		t.Errorf("esperado Content-Type application/json, recebido '%s'", rec.Header().Get("Content-Type"))
	}

	var decoded IESListResponse
	if err := json.NewDecoder(rec.Body).Decode(&decoded); err != nil {
		t.Fatalf("resposta não é JSON válido: %v", err)
	}
	if len(decoded.Results) != 1 || decoded.Results[0].CoIES != "376" {
		t.Errorf("resposta inesperada: %+v", decoded)
	}
}

func TestHandlerRetornaErro500QuandoServiceFalha(t *testing.T) {
	mockService := &MockService{ReturnErr: context.DeadlineExceeded}
	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/ies", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("esperado 500, recebido %d", rec.Code)
	}
}

func TestDetailHandlerRejeitaMetodoNaoGET(t *testing.T) {
	handler := &DetailHandler{Service: &MockService{}}

	req := httptest.NewRequest(http.MethodDelete, "/ies/376", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("esperado 405, recebido %d", rec.Code)
	}
}

func TestDetailHandlerRetornaIES(t *testing.T) {
	mockService := &MockService{ReturnIES: &IES{CoIES: "376", UF: "SP"}}
	handler := &DetailHandler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/ies/376", nil)
	req.SetPathValue("co_ies", "376")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200, recebido %d", rec.Code)
	}
	if mockService.CapturedID != "376" {
		t.Errorf("co_ies não repassado: %s", mockService.CapturedID)
	}

	var decoded IES
	if err := json.NewDecoder(rec.Body).Decode(&decoded); err != nil {
		t.Fatalf("resposta não é JSON válido: %v", err)
	}
	if decoded.CoIES != "376" {
		t.Errorf("IES inesperada: %+v", decoded)
	}
}

func TestDetailHandlerRetorna404QuandoNaoEncontrado(t *testing.T) {
	mockService := &MockService{ReturnGetErr: ErrNotFound}
	handler := &DetailHandler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/ies/999", nil)
	req.SetPathValue("co_ies", "999")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("esperado 404, recebido %d", rec.Code)
	}
}
