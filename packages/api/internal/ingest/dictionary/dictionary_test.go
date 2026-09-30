package dictionary

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"strings"
	"sync/atomic"
	"testing"

	"api_estudante/internal/config"
	"api_estudante/internal/testutil"
)

func bulkResponse(w http.ResponseWriter, body string) {
	actions := testutil.CountBulkActions(body)
	items := make([]string, actions)
	for i := range items {
		items[i] = `{"index":{"status":201}}`
	}
	w.Header().Set("Content-Type", "application/json")
	_, _ = fmt.Fprintf(w, `{"took":1,"errors":false,"items":[%s]}`, strings.Join(items, ","))
}

func TestUniqueTermsPaginaAplicaTrimEDedup(t *testing.T) {
	var calls int32
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if atomic.AddInt32(&calls, 1) == 1 {
			_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"after_key":{"term":"MEDICINA"},"buckets":[{"key":{"term":" DIREITO "}},{"key":{"term":"DIREITO"}}]}}}`))
			return
		}
		_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"buckets":[{"key":{"term":"MEDICINA"}},{"key":{"term":"FÍSICA"}}]}}}`))
	})

	terms, err := uniqueTerms(context.Background(), client, "cursos", "curso.no_curso.keyword")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	want := []string{"DIREITO", "FÍSICA", "MEDICINA"}
	if !reflect.DeepEqual(terms, want) {
		t.Errorf("termos = %v, esperado %v", terms, want)
	}
	if got := atomic.LoadInt32(&calls); got != 2 {
		t.Errorf("chamadas de busca = %d, esperado 2 (paginação)", got)
	}
}

func TestUniqueTermsEnviaAfterKeyNaPaginaSeguinte(t *testing.T) {
	var bodies []string
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		bodies = append(bodies, string(raw))

		w.Header().Set("Content-Type", "application/json")
		if len(bodies) == 1 {
			_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"after_key":{"term":"MEDICINA"},"buckets":[{"key":{"term":"DIREITO"}}]}}}`))
			return
		}
		_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"buckets":[{"key":{"term":"MEDICINA"}}]}}}`))
	})

	if _, err := uniqueTerms(context.Background(), client, "cursos", "curso.no_curso.keyword"); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if len(bodies) != 2 {
		t.Fatalf("buscas = %d, esperado 2", len(bodies))
	}
	if strings.Contains(bodies[0], `"after"`) {
		t.Errorf("primeira busca não deveria ter after: %s", bodies[0])
	}
	if !strings.Contains(bodies[1], `"after"`) || !strings.Contains(bodies[1], "MEDICINA") {
		t.Errorf("segunda busca deveria repetir o after_key: %s", bodies[1])
	}
}

func TestUniqueTermsRetornaErroEmFalha(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error":"boom"}`))
	})

	if _, err := uniqueTerms(context.Background(), client, "cursos", "curso.no_curso.keyword"); err == nil {
		t.Fatal("esperado erro para status 500")
	}
}

func TestBuildRecriaIndiceQuandoJaExiste(t *testing.T) {
	var deleted, created int32

	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodHead && r.URL.Path == "/dicionario_cursos":
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodDelete && r.URL.Path == "/dicionario_cursos":
			atomic.AddInt32(&deleted, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPut && r.URL.Path == "/dicionario_cursos":
			atomic.AddInt32(&created, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case strings.HasSuffix(r.URL.Path, "/_search"):
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"buckets":[{"key":{"term":"DIREITO"}}]}}}`))
		case strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			bulkResponse(w, string(body))
		default:
			w.WriteHeader(http.StatusOK)
		}
	})

	cfg := &config.Config{NumWorkers: 1, FlushBytes: 10_000, FlushIntervalSec: 1}
	inserted, err := Build(context.Background(), client, cfg, Spec{
		SourceIndex: "cursos",
		TargetIndex: "dicionario_cursos",
		SourceField: "curso.no_curso.keyword",
		DocField:    "no_curso",
		Mapping:     []byte(`{"mappings":{}}`),
	})
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if inserted != 1 {
		t.Errorf("inseridos = %d, esperado 1", inserted)
	}
	if atomic.LoadInt32(&deleted) != 1 {
		t.Error("índice existente deveria ser removido antes de recriar")
	}
	if atomic.LoadInt32(&created) != 1 {
		t.Errorf("índice criado %d vezes, esperado 1", created)
	}
}

func TestBuildPropagaErroDaBuscaDeTermos(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodHead {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		if r.Method == http.MethodPut {
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error":"boom"}`))
	})

	cfg := &config.Config{NumWorkers: 1, FlushBytes: 10_000, FlushIntervalSec: 1}
	if _, err := Build(context.Background(), client, cfg, Spec{
		SourceIndex: "cursos",
		TargetIndex: "dicionario_cursos",
		SourceField: "curso.no_curso.keyword",
		DocField:    "no_curso",
		Mapping:     []byte(`{"mappings":{}}`),
	}); err == nil {
		t.Fatal("esperado erro propagado da busca de termos")
	}
}

func TestBuildRecriaIndexaEAtualiza(t *testing.T) {
	var created, refreshed int32

	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodHead && r.URL.Path == "/dicionario_cursos":
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPut && r.URL.Path == "/dicionario_cursos":
			atomic.AddInt32(&created, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_search"):
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"buckets":[{"key":{"term":"DIREITO"}},{"key":{"term":"MEDICINA"}}]}}}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			bulkResponse(w, string(body))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_refresh"):
			atomic.AddInt32(&refreshed, 1)
			w.WriteHeader(http.StatusOK)
		default:
			w.WriteHeader(http.StatusOK)
		}
	})

	cfg := &config.Config{NumWorkers: 1, FlushBytes: 10_000, FlushIntervalSec: 1}
	inserted, err := Build(context.Background(), client, cfg, Spec{
		SourceIndex: "cursos",
		TargetIndex: "dicionario_cursos",
		SourceField: "curso.no_curso.keyword",
		DocField:    "no_curso",
		Mapping:     []byte(`{"mappings":{}}`),
	})
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if inserted != 2 {
		t.Errorf("inseridos = %d, esperado 2", inserted)
	}
	if atomic.LoadInt32(&created) != 1 {
		t.Error("índice de dicionário não foi criado")
	}
	if atomic.LoadInt32(&refreshed) != 1 {
		t.Error("refresh do dicionário não foi chamado")
	}
}
