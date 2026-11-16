package municipios

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

type mockService struct {
	result Response
	err    error
}

func (m *mockService) ListarMunicipios(context.Context) (Response, error) {
	return m.result, m.err
}

func TestHandlerDevolveMapaPorUF(t *testing.T) {
	svc := &mockService{result: Response{"SP": {{Codigo: "3550308", Nome: "São Paulo"}}}}
	handler := &Handler{Service: svc}

	req := httptest.NewRequest(http.MethodGet, "/municipios", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200, recebido %d", rec.Code)
	}

	var decoded Response
	if err := json.NewDecoder(rec.Body).Decode(&decoded); err != nil {
		t.Fatalf("resposta inválida: %v", err)
	}
	if len(decoded["SP"]) != 1 || decoded["SP"][0].Nome != "São Paulo" {
		t.Errorf("resposta inesperada: %#v", decoded)
	}
}

func TestHandlerRetorna500EmErro(t *testing.T) {
	handler := &Handler{Service: &mockService{err: errors.New("boom")}}

	req := httptest.NewRequest(http.MethodGet, "/municipios", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("esperado 500, recebido %d", rec.Code)
	}
}
