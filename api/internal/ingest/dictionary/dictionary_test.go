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

// testDate é uma data fixa usada nos testes para tornar os nomes de índice
// determinísticos (<target>-<data>).
const testDate = "2026-10-20"

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

	terms, err := uniqueTerms(context.Background(), client, "cursos-latest", "curso.no_curso.keyword")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	want := []termCount{{term: "DIREITO"}, {term: "FÍSICA"}, {term: "MEDICINA"}}
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

	if _, err := uniqueTerms(context.Background(), client, "cursos-latest", "curso.no_curso.keyword"); err != nil {
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

	if _, err := uniqueTerms(context.Background(), client, "cursos-latest", "curso.no_curso.keyword"); err == nil {
		t.Fatal("esperado erro para status 500")
	}
}

func TestTermStreamEmiteContagem(t *testing.T) {
	stream := &termStream{field: "no_curso", terms: []termCount{{term: "DIREITO", count: 42}}}

	doc, err := stream.Next()
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	body, ok := doc.Body.(map[string]any)
	if !ok {
		t.Fatalf("body = %T, esperado map[string]any", doc.Body)
	}
	if body["no_curso"] != "DIREITO" {
		t.Errorf("no_curso = %v, esperado DIREITO", body["no_curso"])
	}
	if body["count"] != 42 {
		t.Errorf("count = %v, esperado 42", body["count"])
	}

	if _, err := stream.Next(); err == nil {
		t.Fatal("esperado fim do stream")
	}
}

func TestBuildTrocaAliasEApagaIndiceAntigo(t *testing.T) {
	var created, deletedOld int32

	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/dicionario-cursos-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodDelete && r.URL.Path == "/dicionario-cursos-2026-10-19":
			atomic.AddInt32(&deletedOld, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPut && r.URL.Path == "/dicionario-cursos-"+testDate:
			atomic.AddInt32(&created, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case strings.HasSuffix(r.URL.Path, "/_search"):
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"buckets":[{"key":{"term":"DIREITO"}}]}}}`))
		case strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			bulkResponse(w, string(body))
		case strings.HasSuffix(r.URL.Path, "/_refresh"):
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodGet && r.URL.Path == "/_alias/dicionario-cursos-latest":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"dicionario-cursos-2026-10-19":{"aliases":{"dicionario-cursos-latest":{}}}}`))
		case r.Method == http.MethodPost && r.URL.Path == "/_aliases":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
		}
	})

	cfg := &config.Config{NumWorkers: 1, FlushBytes: 10_000, FlushIntervalSec: 1}
	inserted, err := Build(context.Background(), client, cfg, Spec{
		SourceIndex: "cursos-latest",
		TargetIndex: "dicionario-cursos",
		SourceField: "curso.no_curso.keyword",
		DocField:    "no_curso",
		Mapping:     []byte(`{"mappings":{}}`),
	}, testDate)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if inserted != 1 {
		t.Errorf("inseridos = %d, esperado 1", inserted)
	}
	if atomic.LoadInt32(&created) != 1 {
		t.Errorf("índice datado criado %d vezes, esperado 1", created)
	}
	if atomic.LoadInt32(&deletedOld) != 1 {
		t.Errorf("índice antigo deveria ser apagado 1 vez, obtido %d", deletedOld)
	}
}

func TestBuildPropagaErroDaBuscaDeTermos(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodDelete {
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
		SourceIndex: "cursos-latest",
		TargetIndex: "dicionario-cursos",
		SourceField: "curso.no_curso.keyword",
		DocField:    "no_curso",
		Mapping:     []byte(`{"mappings":{}}`),
	}, testDate); err == nil {
		t.Fatal("esperado erro propagado da busca de termos")
	}
}

func TestBuildNaoTrocaAliasQuandoIndexacaoFalha(t *testing.T) {
	var aliasListed, aliasPointed int32

	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/dicionario-cursos-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPut && r.URL.Path == "/dicionario-cursos-"+testDate:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case strings.HasSuffix(r.URL.Path, "/_search"):
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"buckets":[{"key":{"term":"DIREITO"}}]}}}`))
		case strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			actions := testutil.CountBulkActions(string(body))
			items := make([]string, actions)
			for i := range items {
				items[i] = `{"index":{"status":400,"error":{"type":"mapper_parsing_exception","reason":"boom"}}}`
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"took":1,"errors":true,"items":[` + strings.Join(items, ",") + `]}`))
		case strings.HasSuffix(r.URL.Path, "/_refresh"):
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodGet && r.URL.Path == "/_alias/dicionario-cursos-latest":
			atomic.AddInt32(&aliasListed, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{}`))
		case r.Method == http.MethodPost && r.URL.Path == "/_aliases":
			atomic.AddInt32(&aliasPointed, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
		}
	})

	cfg := &config.Config{NumWorkers: 1, FlushBytes: 10_000, FlushIntervalSec: 1}
	if _, err := Build(context.Background(), client, cfg, Spec{
		SourceIndex: "cursos-latest",
		TargetIndex: "dicionario-cursos",
		SourceField: "curso.no_curso.keyword",
		DocField:    "no_curso",
		Mapping:     []byte(`{"mappings":{}}`),
	}, testDate); err == nil {
		t.Fatal("esperado erro de rejeição na indexação do dicionário")
	}
	if atomic.LoadInt32(&aliasListed) != 0 || atomic.LoadInt32(&aliasPointed) != 0 {
		t.Errorf("após falha não deveria haver troca de alias: listou=%d trocou=%d", aliasListed, aliasPointed)
	}
}

func TestBuildIndexaEAtualizaAlias(t *testing.T) {
	var created, refreshed, aliasPointed int32

	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/dicionario-cursos-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPut && r.URL.Path == "/dicionario-cursos-"+testDate:
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
		case r.Method == http.MethodGet && r.URL.Path == "/_alias/dicionario-cursos-latest":
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPost && r.URL.Path == "/_aliases":
			atomic.AddInt32(&aliasPointed, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
		}
	})

	cfg := &config.Config{NumWorkers: 1, FlushBytes: 10_000, FlushIntervalSec: 1}
	inserted, err := Build(context.Background(), client, cfg, Spec{
		SourceIndex: "cursos-latest",
		TargetIndex: "dicionario-cursos",
		SourceField: "curso.no_curso.keyword",
		DocField:    "no_curso",
		Mapping:     []byte(`{"mappings":{}}`),
	}, testDate)
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
	if atomic.LoadInt32(&aliasPointed) != 1 {
		t.Error("alias do dicionário não foi atualizado")
	}
}

func TestBuildStreamIndexaDocumentosSemBuscarTermosUnicos(t *testing.T) {
	var searched, indexed, aliasPointed int32
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/dicionario-ies-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPut && r.URL.Path == "/dicionario-ies-"+testDate:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			atomic.AddInt32(&indexed, int32(testutil.CountBulkActions(string(body))))
			bulkResponse(w, string(body))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_refresh"):
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodGet && r.URL.Path == "/_alias/dicionario-ies-latest":
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPost && r.URL.Path == "/_aliases":
			atomic.AddInt32(&aliasPointed, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_search"):
			atomic.AddInt32(&searched, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"buckets":[]}}}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
		}
	})

	cfg := &config.Config{NumWorkers: 1, FlushBytes: 10_000, FlushIntervalSec: 1}
	stream := &termStream{field: "no_ies", terms: []termCount{{term: "USP"}, {term: "UNIFESP"}}}
	inserted, err := BuildStream(context.Background(), client, cfg, "dicionario-ies", []byte(`{"mappings":{}}`), stream, testDate)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if inserted != 2 {
		t.Errorf("inseridos = %d, esperado 2", inserted)
	}
	if atomic.LoadInt32(&searched) != 0 {
		t.Errorf("buscas de termos únicos = %d, esperado 0 (BuildStream usa o stream)", searched)
	}
	if atomic.LoadInt32(&indexed) != 2 {
		t.Errorf("documentos indexados = %d, esperado 2", indexed)
	}
	if atomic.LoadInt32(&aliasPointed) != 1 {
		t.Errorf("alias atualizado %d vezes, esperado 1", aliasPointed)
	}
}
