package sugestoes

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// MockService implementa Service para teste do handler
type MockService struct {
	CapturedTermo   string
	CapturedLimit   int
	Called          bool
	ReturnSugestoes []string
	ReturnErr       error
}

func (m *MockService) Sugerir(_ context.Context, termo string, limit int) ([]string, error) {
	m.Called = true
	m.CapturedTermo = termo
	m.CapturedLimit = limit
	return m.ReturnSugestoes, m.ReturnErr
}

func TestSugestoesHandlerRejeitaMetodoNaoGET(t *testing.T) {
	mockService := &MockService{}
	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(http.MethodPost, "/cursos/sugestoes?q=medicina", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("esperado status 405, recebido %d", rec.Code)
	}
	if mockService.Called {
		t.Error("service não deveria ser chamado para método não permitido")
	}
}

func TestSugestoesHandlerRequerParametroQ(t *testing.T) {
	mockService := &MockService{}
	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/cursos/sugestoes", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("esperado status 400, recebido %d", rec.Code)
	}
	if mockService.Called {
		t.Error("service não deveria ser chamado sem o parâmetro q")
	}
}

func TestSugestoesHandlerRetornaSugestoesJSON(t *testing.T) {
	mockService := &MockService{
		ReturnSugestoes: []string{"MEDICINA", "MEDICINA VETERINÁRIA"},
	}
	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/cursos/sugestoes?q=medicina&limit=5", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado status 200, recebido %d", rec.Code)
	}
	if !mockService.Called || mockService.CapturedTermo != "medicina" {
		t.Errorf("esperado service chamado com termo 'medicina', chamado=%v termo='%s'", mockService.Called, mockService.CapturedTermo)
	}
	if mockService.CapturedLimit != 5 {
		t.Errorf("esperado limit 5 repassado ao service, recebido %d", mockService.CapturedLimit)
	}

	if rec.Header().Get("Content-Type") != "application/json" {
		t.Errorf("esperado Content-Type application/json, recebido '%s'", rec.Header().Get("Content-Type"))
	}

	decoded := SugestoesResponse{}
	if err := json.NewDecoder(rec.Body).Decode(&decoded); err != nil {
		t.Fatalf("resposta não é JSON válido: %v", err)
	}
	if len(decoded.Results) != 2 || decoded.Results[0] != "MEDICINA" || decoded.Results[1] != "MEDICINA VETERINÁRIA" {
		t.Errorf("esperado results ['MEDICINA','MEDICINA VETERINÁRIA'], recebido %v", decoded.Results)
	}
}

func TestSugestoesHandlerRetornaErro500QuandoServiceFalha(t *testing.T) {
	mockService := &MockService{
		ReturnErr: context.DeadlineExceeded,
	}
	handler := &Handler{Service: mockService}

	req := httptest.NewRequest(http.MethodGet, "/cursos/sugestoes?q=medicina", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("esperado status 500, recebido %d", rec.Code)
	}
}
