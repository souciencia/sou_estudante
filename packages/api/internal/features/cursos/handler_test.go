package cursos

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// MockService implementa Service para teste de handler
type MockService struct {
	CapturedQuery   string
	CapturedFilters SearchFilterParams
	CapturedPage    int
	CapturedLimit   int
	ReturnResponse  *CursoListResponse
	ReturnErr       error

	CapturedID   string
	ReturnCurso  *Curso
	ReturnGetErr error
}

func (m *MockService) BuscarCursos(
	ctx context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*CursoListResponse, error) {
	m.CapturedQuery = query
	m.CapturedFilters = filters
	m.CapturedPage = page
	m.CapturedLimit = limit
	return m.ReturnResponse, m.ReturnErr
}

func (m *MockService) BuscarCursoPorID(_ context.Context, id string) (*Curso, error) {
	m.CapturedID = id
	return m.ReturnCurso, m.ReturnGetErr
}

func TestHandlerExtraiFiltrosCumulativos(t *testing.T) {
	mockService := &MockService{
		ReturnResponse: &CursoListResponse{
			Total:   0,
			Page:    1,
			Limit:   20,
			Results: []Curso{},
			Links:   PaginationLinks{Self: "/cursos?q=medicina"},
		},
	}

	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/cursos?q=medicina&uf=SP,RJ&turno=Noturno,Diurno&grau=Bacharelado&sort=enade", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado status 200, recebido %d", rec.Code)
	}

	if mockService.CapturedQuery != "medicina" {
		t.Errorf("esperado query 'medicina', recebido '%s'", mockService.CapturedQuery)
	}
	if len(mockService.CapturedFilters.UF) != 2 || mockService.CapturedFilters.UF[0] != "SP" || mockService.CapturedFilters.UF[1] != "RJ" {
		t.Errorf("esperado UF ['SP', 'RJ'], recebido '%v'", mockService.CapturedFilters.UF)
	}
	if len(mockService.CapturedFilters.Turno) != 2 || mockService.CapturedFilters.Turno[0] != "Noturno" || mockService.CapturedFilters.Turno[1] != "Diurno" {
		t.Errorf("esperado Turno ['Noturno', 'Diurno'], recebido '%v'", mockService.CapturedFilters.Turno)
	}
	if len(mockService.CapturedFilters.Grau) != 1 || mockService.CapturedFilters.Grau[0] != "Bacharelado" {
		t.Errorf("esperado Grau ['Bacharelado'], recebido '%v'", mockService.CapturedFilters.Grau)
	}
	if mockService.CapturedFilters.Sort != "enade" {
		t.Errorf("esperado Sort 'enade', recebido '%s'", mockService.CapturedFilters.Sort)
	}
}

func TestParseExactParam(t *testing.T) {
	cases := map[string]bool{
		"":      true,
		"true":  true,
		"1":     true,
		"false": false,
		"0":     false,
		"lixo":  true,
	}
	for raw, want := range cases {
		if got := parseExactParam(raw); got != want {
			t.Errorf("parseExactParam(%q) = %v, esperado %v", raw, got, want)
		}
	}
}

func TestHandlerExtraiExactComDefaultTrue(t *testing.T) {
	mockService := &MockService{
		ReturnResponse: &CursoListResponse{
			Total:   0,
			Page:    1,
			Limit:   20,
			Results: []Curso{},
			Links:   PaginationLinks{Self: "/cursos?q=medicina"},
		},
	}

	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/cursos?q=medicina", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if !mockService.CapturedFilters.Exact {
		t.Errorf("esperado Exact=true por padrão, recebido false")
	}

	reqOff := httptest.NewRequest(http.MethodGet, "/cursos?q=medicina&exact=false", nil)
	recOff := httptest.NewRecorder()
	handler.ServeHTTP(recOff, reqOff)

	if mockService.CapturedFilters.Exact {
		t.Errorf("esperado Exact=false quando exact=false, recebido true")
	}
}

func TestDetailHandlerRejeitaMetodoNaoGET(t *testing.T) {
	handler := &DetailHandler{Service: &MockService{}}

	req := httptest.NewRequest(http.MethodDelete, "/cursos/123", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("esperado 405, recebido %d", rec.Code)
	}
}

func TestDetailHandlerRejeitaIDVazio(t *testing.T) {
	handler := &DetailHandler{Service: &MockService{}}

	req := httptest.NewRequest(http.MethodGet, "/cursos/", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400, recebido %d", rec.Code)
	}
}

func TestDetailHandlerRetornaCurso(t *testing.T) {
	mockService := &MockService{ReturnCurso: &Curso{Edicao: "2024", Curso: DadosCurso{NoCurso: "MEDICINA"}}}
	handler := &DetailHandler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/cursos/123", nil)
	req.SetPathValue("id", "123")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200, recebido %d", rec.Code)
	}
	if mockService.CapturedID != "123" {
		t.Errorf("id não repassado: %s", mockService.CapturedID)
	}

	var decoded Curso
	if err := json.NewDecoder(rec.Body).Decode(&decoded); err != nil {
		t.Fatalf("resposta não é JSON válido: %v", err)
	}
	if decoded.Curso.NoCurso != "MEDICINA" {
		t.Errorf("curso inesperado: %+v", decoded)
	}
}

func TestDetailHandlerRetorna404QuandoNaoEncontrado(t *testing.T) {
	mockService := &MockService{ReturnGetErr: ErrNotFound}
	handler := &DetailHandler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/cursos/999", nil)
	req.SetPathValue("id", "999")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("esperado 404, recebido %d", rec.Code)
	}
}
