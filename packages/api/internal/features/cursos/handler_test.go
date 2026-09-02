package cursos

import (
	"context"
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

func TestHandlerExtraiFiltros(t *testing.T) {
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

	req := httptest.NewRequest(http.MethodGet, "/cursos?q=medicina&uf=SP&turno=Noturno&grau=Bacharelado&sort=enade", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado status 200, recebido %d", rec.Code)
	}

	if mockService.CapturedQuery != "medicina" {
		t.Errorf("esperado query 'medicina', recebido '%s'", mockService.CapturedQuery)
	}
	if mockService.CapturedFilters.UF != "SP" {
		t.Errorf("esperado UF 'SP', recebido '%s'", mockService.CapturedFilters.UF)
	}
	if mockService.CapturedFilters.Turno != "Noturno" {
		t.Errorf("esperado Turno 'Noturno', recebido '%s'", mockService.CapturedFilters.Turno)
	}
	if mockService.CapturedFilters.Grau != "Bacharelado" {
		t.Errorf("esperado Grau 'Bacharelado', recebido '%s'", mockService.CapturedFilters.Grau)
	}
	if mockService.CapturedFilters.Sort != "enade" {
		t.Errorf("esperado Sort 'enade', recebido '%s'", mockService.CapturedFilters.Sort)
	}
}
