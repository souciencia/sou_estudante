package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"api_estudante/internal/config"
)

// newTestRouter monta o roteador com um cliente de Elasticsearch nil. Os testes
// abaixo só exercitam caminhos que respondem antes de tocar no Elasticsearch.
func newTestRouter() http.Handler {
	return newRouter(nil, &config.Config{
		DictIndexName:    "dicionario_cursos",
		IESDictIndexName: "dicionario_ies",
	})
}

func TestRouterRejeitaMetodoNaoPermitido(t *testing.T) {
	router := newTestRouter()

	cases := []struct {
		name   string
		method string
		path   string
	}{
		{"cursos", http.MethodPost, "/cursos?q=direito"},
		{"curso detalhe", http.MethodDelete, "/cursos/1"},
		{"sugestões cursos", http.MethodPost, "/cursos/sugestoes?q=direito"},
		{"ies", http.MethodPost, "/ies?q=federal"},
		{"ies detalhe", http.MethodDelete, "/ies/376"},
		{"sugestões ies", http.MethodPost, "/ies/sugestoes?q=federal"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, nil)
			rec := httptest.NewRecorder()
			router.ServeHTTP(rec, req)

			if rec.Code != http.StatusMethodNotAllowed {
				t.Fatalf("%s %s = %d, esperado 405", tc.method, tc.path, rec.Code)
			}
			if allow := rec.Header().Get("Allow"); !strings.Contains(allow, http.MethodGet) {
				t.Errorf("header Allow = %q, esperado conter GET", allow)
			}
		})
	}
}

func TestRouterExigeParametroQ(t *testing.T) {
	router := newTestRouter()

	for _, path := range []string{"/cursos", "/cursos/sugestoes", "/ies", "/ies/sugestoes"} {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("GET %s = %d, esperado 400", path, rec.Code)
			continue
		}
		var body map[string]string
		if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
			t.Errorf("GET %s: corpo não é JSON: %v", path, err)
			continue
		}
		if body["error"] == "" {
			t.Errorf("GET %s: esperado campo error no corpo", path)
		}
	}
}

// A rota literal /cursos/sugestoes deve vencer a rota coringa /cursos/{id}.
func TestRouterPriorizaRotaLiteralDeSugestoes(t *testing.T) {
	router := newTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/cursos/sugestoes", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("GET /cursos/sugestoes sem q = %d, esperado 400 (handler de sugestões)", rec.Code)
	}
}

func TestRouterHealthz(t *testing.T) {
	router := newTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("GET /healthz = %d, esperado 200", rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("Content-Type = %q, esperado application/json", ct)
	}

	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("corpo não é JSON: %v", err)
	}
	if body["status"] != "ok" {
		t.Errorf("status = %q, esperado ok", body["status"])
	}
}

func TestRouterAplicaCorsCompleto(t *testing.T) {
	router := newTestRouter()

	req := httptest.NewRequest(http.MethodOptions, "/cursos", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("OPTIONS = %d, esperado 200", rec.Code)
	}
	assertCors(t, rec)
}

func TestRouterCorsPropagaRequisicaoNormal(t *testing.T) {
	router := newTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("GET /healthz com CORS = %d, esperado 200", rec.Code)
	}
	assertCors(t, rec)
}

func assertCors(t *testing.T, rec *httptest.ResponseRecorder) {
	t.Helper()
	headers := map[string]string{
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "GET, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
	}
	for header, want := range headers {
		if got := rec.Header().Get(header); got != want {
			t.Errorf("%s = %q, esperado %q", header, got, want)
		}
	}
}
