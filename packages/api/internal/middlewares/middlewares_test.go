package middlewares

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRecoverResponde500EmPanic(t *testing.T) {
	handler := Recover(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("boom")
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/cursos", nil))

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, esperado 500", rec.Code)
	}

	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("corpo não é JSON: %v", err)
	}
	if body["error"] == "" {
		t.Error("esperado campo error no corpo")
	}
}

func TestRecoverNaoVazaDetalheDoPanic(t *testing.T) {
	handler := Recover(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("detalhe-sensivel")
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/cursos", nil))

	raw := rec.Body.String()
	var body map[string]string
	_ = json.Unmarshal([]byte(raw), &body)
	if body["error"] != "Erro interno" {
		t.Errorf("error = %q, esperado %q", body["error"], "Erro interno")
	}
	if strings.Contains(raw, "detalhe-sensivel") {
		t.Error("o valor do panic não deveria vazar na resposta")
	}
}

func TestRecoverNaoInterfereSemPanic(t *testing.T) {
	handler := Recover(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusTeapot)
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))

	if rec.Code != http.StatusTeapot {
		t.Fatalf("status = %d, esperado 418", rec.Code)
	}
}

func TestRequestIDGeraQuandoAusente(t *testing.T) {
	var fromContext string
	handler := RequestID(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		fromContext = RequestIDFromContext(r.Context())
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))

	header := rec.Header().Get(RequestIDHeader)
	if header == "" {
		t.Fatal("esperado header X-Request-Id gerado")
	}
	if fromContext != header {
		t.Errorf("contexto = %q, header = %q", fromContext, header)
	}
}

func TestRequestIDReaproveitaValorRecebido(t *testing.T) {
	handler := RequestID(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {}))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set(RequestIDHeader, "abc-123")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if got := rec.Header().Get(RequestIDHeader); got != "abc-123" {
		t.Errorf("header = %q, esperado abc-123", got)
	}
}

func TestAccessLogPreservaStatusDoHandler(t *testing.T) {
	handler := AccessLog(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusCreated)
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))

	if rec.Code != http.StatusCreated {
		t.Fatalf("status = %d, esperado 201", rec.Code)
	}
}

func TestCorsMiddlewareRespondePreflight(t *testing.T) {
	chamou := false
	handler := CorsMiddleware(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		chamou = true
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodOptions, "/cursos", nil))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, esperado 200", rec.Code)
	}
	if chamou {
		t.Error("preflight não deveria alcançar o handler seguinte")
	}
	assertCorsHeaders(t, rec)
}

func TestCorsMiddlewarePassaAdianteEAdicionaHeaders(t *testing.T) {
	chamou := false
	handler := CorsMiddleware(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		chamou = true
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/cursos", nil))

	if !chamou {
		t.Error("requisição GET deveria alcançar o handler seguinte")
	}
	assertCorsHeaders(t, rec)
}

func assertCorsHeaders(t *testing.T, rec *httptest.ResponseRecorder) {
	t.Helper()
	if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("Allow-Origin = %q, esperado *", got)
	}
	if got := rec.Header().Get("Access-Control-Allow-Methods"); got != "GET, OPTIONS" {
		t.Errorf("Allow-Methods = %q, esperado GET, OPTIONS", got)
	}
	if got := rec.Header().Get("Access-Control-Allow-Headers"); got != "Content-Type, Authorization" {
		t.Errorf("Allow-Headers = %q, esperado Content-Type, Authorization", got)
	}
}

func TestAccessLogRegistraStatusPadraoEContexto(t *testing.T) {
	var buf bytes.Buffer
	original := slog.Default()
	slog.SetDefault(slog.New(slog.NewJSONHandler(&buf, nil)))
	t.Cleanup(func() { slog.SetDefault(original) })

	// Mesma ordem de newRouter: RequestID por fora para que o AccessLog veja o id.
	handler := RequestID(AccessLog(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("ok"))
	})))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/cursos", nil))

	var entry map[string]interface{}
	if err := json.Unmarshal(buf.Bytes(), &entry); err != nil {
		t.Fatalf("log não é JSON: %v (%s)", err, buf.String())
	}
	if entry["status"] != float64(http.StatusOK) {
		t.Errorf("status logado = %v, esperado 200", entry["status"])
	}
	if entry["path"] != "/cursos" {
		t.Errorf("path logado = %v, esperado /cursos", entry["path"])
	}
	if entry["request_id"] == "" {
		t.Error("esperado request_id preenchido no log")
	}
}
