package seed

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"
	"sync/atomic"
	"testing"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/config"
	cursosingest "api_estudante/internal/features/cursos/ingest"
	"api_estudante/internal/features/ies"
	"api_estudante/internal/ingest/bulk"
	"api_estudante/internal/ingest/dictionary"
	"api_estudante/internal/testutil"
)

func TestNeedsIndexing(t *testing.T) {
	cases := []struct {
		name   string
		exists bool
		count  int64
		want   bool
	}{
		{"índice ausente", false, 0, true},
		{"índice vazio", true, 0, true},
		{"índice populado", true, 42, false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := needsIndexing(tc.exists, tc.count); got != tc.want {
				t.Errorf("needsIndexing(%v, %d) = %v, esperado %v", tc.exists, tc.count, got, tc.want)
			}
		})
	}
}

func TestIndexState(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.HasSuffix(r.URL.Path, "/_count"):
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"count":5}`))
		case r.Method == http.MethodHead && r.URL.Path == "/cursos":
			w.WriteHeader(http.StatusOK)
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	})

	exists, count, err := indexState(context.Background(), client, "cursos")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if !exists || count != 5 {
		t.Errorf("indexState(cursos) = %v, %d; esperado true, 5", exists, count)
	}

	exists, count, err = indexState(context.Background(), client, "inexistente")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if exists || count != 0 {
		t.Errorf("indexState(inexistente) = %v, %d; esperado false, 0", exists, count)
	}
}

// sliceStream implementa bulk.Stream sobre uma lista em memória.
type sliceStream struct {
	docs []bulk.Document
	next int
}

func (s *sliceStream) Next() (*bulk.Document, error) {
	if s.next >= len(s.docs) {
		return nil, io.EOF
	}
	doc := s.docs[s.next]
	s.next++
	return &doc, nil
}

func (s *sliceStream) Close() error { return nil }

func testConfig() *config.Config {
	return &config.Config{
		ESURL:            "http://localhost:9200",
		ESIngestAPIKey:   "chave",
		CursosIndexName:  "cursos",
		IESIndexName:     "ies",
		DictIndexName:    "dicionario_cursos",
		IESDictIndexName: "dicionario_ies",
		JSONFilePath:     "/data/cursos.json",
		IESJSONFilePath:  "/data/ies.json",
		NumWorkers:       1,
		FlushBytes:       10_000,
		FlushIntervalSec: 1,
	}
}

func TestRunRequerIngestAPIKey(t *testing.T) {
	cfg := testConfig()
	cfg.ESIngestAPIKey = ""

	err := run(context.Background(), cfg, defaultDeps())
	if err == nil || !strings.Contains(err.Error(), "ES_INGEST_APIKEY") {
		t.Fatalf("esperado erro de API key ausente, obtido %v", err)
	}
}

// Run é o entrypoint de produção; valida a checagem de API key antes de criar
// qualquer cliente (sem tocar em rede).
func TestRunRejeitaConfigSemAPIKey(t *testing.T) {
	cfg := testConfig()
	cfg.ESIngestAPIKey = ""

	if err := Run(context.Background(), cfg); err == nil || !strings.Contains(err.Error(), "ES_INGEST_APIKEY") {
		t.Fatalf("esperado erro de API key ausente, obtido %v", err)
	}
}

func TestRunRequerArquivosDeOrigem(t *testing.T) {
	deps := defaultDeps()
	deps.Stat = func(path string) error { return errors.New("arquivo ausente") }

	err := run(context.Background(), testConfig(), deps)
	if err == nil || !strings.Contains(err.Error(), "indisponível") {
		t.Fatalf("esperado erro de arquivo indisponível, obtido %v", err)
	}
}

func TestRunIgnoraIngestaoQuandoIndicesJaPopulados(t *testing.T) {
	var writes int32
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodHead:
			w.WriteHeader(http.StatusOK)
		case strings.HasSuffix(r.URL.Path, "/_count"):
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"count":10}`))
		default:
			atomic.AddInt32(&writes, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{}`))
		}
	})

	opened := false
	deps := defaultDeps()
	deps.Stat = func(string) error { return nil }
	deps.NewClient = func(string, string) (*es.Client, error) { return client, nil }
	deps.LoadIES = func(string) (map[string]ies.IES, error) { return nil, nil }
	deps.OpenCursos = func(string, map[string]cursosingest.InstituicaoInfo) (bulk.Stream, error) {
		opened = true
		return nil, errors.New("não deveria abrir stream")
	}
	deps.OpenIES = func(string) (bulk.Stream, error) {
		opened = true
		return nil, errors.New("não deveria abrir stream")
	}

	if err := run(context.Background(), testConfig(), deps); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if opened {
		t.Error("stream de origem foi aberto mesmo com índices populados")
	}
	if got := atomic.LoadInt32(&writes); got != 0 {
		t.Errorf("esperado nenhuma escrita, obtido %d requisições", got)
	}
}

func TestEnsureDataCriaEIngereQuandoAusente(t *testing.T) {
	var created, refreshed int32
	var indexed int32
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodHead && r.URL.Path == "/cursos":
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPut && r.URL.Path == "/cursos":
			atomic.AddInt32(&created, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			actions := testutil.CountBulkActions(string(body))
			atomic.AddInt32(&indexed, int32(actions))
			items := make([]string, actions)
			for i := range items {
				items[i] = `{"index":{"_index":"cursos","status":201}}`
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"took":1,"errors":false,"items":[` + strings.Join(items, ",") + `]}`))
		case strings.HasSuffix(r.URL.Path, "/_refresh"):
			atomic.AddInt32(&refreshed, 1)
			w.WriteHeader(http.StatusOK)
		default:
			w.WriteHeader(http.StatusOK)
		}
	})

	stream := &sliceStream{docs: []bulk.Document{
		{ID: "1", Body: map[string]string{"no_curso": "DIREITO"}},
		{ID: "2", Body: map[string]string{"no_curso": "MEDICINA"}},
	}}
	spec := indexSpec{
		name:    "cursos",
		path:    "/data/cursos.json",
		mapping: []byte(`{"mappings":{}}`),
		open:    func(string) (bulk.Stream, error) { return stream, nil },
	}

	if err := ensureData(context.Background(), client, testConfig(), spec); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if atomic.LoadInt32(&created) != 1 {
		t.Errorf("índice criado %d vezes, esperado 1", created)
	}
	if got := atomic.LoadInt32(&indexed); got != 2 {
		t.Errorf("documentos indexados = %d, esperado 2", got)
	}
	if atomic.LoadInt32(&refreshed) != 1 {
		t.Errorf("refresh chamado %d vezes, esperado 1", refreshed)
	}
}

func TestEnsureDicionarioConstroiQuandoAusente(t *testing.T) {
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
			_, _ = w.Write([]byte(`{"aggregations":{"unique_terms":{"buckets":[{"key":{"term":"DIREITO"}}]}}}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			actions := testutil.CountBulkActions(string(body))
			items := make([]string, actions)
			for i := range items {
				items[i] = `{"index":{"status":201}}`
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"took":1,"errors":false,"items":[` + strings.Join(items, ",") + `]}`))
		case strings.HasSuffix(r.URL.Path, "/_refresh"):
			atomic.AddInt32(&refreshed, 1)
			w.WriteHeader(http.StatusOK)
		default:
			w.WriteHeader(http.StatusOK)
		}
	})

	spec := dictionary.Spec{
		SourceIndex: "cursos",
		TargetIndex: "dicionario_cursos",
		SourceField: "curso.no_curso.keyword",
		DocField:    "no_curso",
		Mapping:     []byte(`{"mappings":{}}`),
	}

	if err := ensureDicionario(context.Background(), client, testConfig(), spec); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if atomic.LoadInt32(&created) != 1 {
		t.Errorf("índice de dicionário criado %d vezes, esperado 1", created)
	}
	if atomic.LoadInt32(&refreshed) != 1 {
		t.Errorf("refresh chamado %d vezes, esperado 1", refreshed)
	}
}

func TestEnsureDataIgnoraQuandoIndicePopulado(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodHead:
			w.WriteHeader(http.StatusOK)
		case strings.HasSuffix(r.URL.Path, "/_count"):
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"count":3}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
		}
	})

	spec := indexSpec{
		name:    "cursos",
		path:    "/data/cursos.json",
		mapping: []byte(`{"mappings":{}}`),
		open: func(string) (bulk.Stream, error) {
			t.Fatal("stream não deveria ser aberto para índice populado")
			return nil, nil
		},
	}

	if err := ensureData(context.Background(), client, testConfig(), spec); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
}
