package seed

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/config"
	cursosingest "api_estudante/internal/features/cursos/ingest"
	"api_estudante/internal/features/ies"
	"api_estudante/internal/ingest/bulk"
	"api_estudante/internal/ingest/dictionary"
	"api_estudante/internal/testutil"
)

// testDate é uma data fixa usada nos testes para tornar os nomes de índice
// determinísticos (<nome>-<data>).
const testDate = "2026-10-20"

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
		ESURL:               "http://localhost:9200",
		ESIngestAPIKey:      "chave",
		CursosIndexName:     "cursos",
		IESIndexName:        "ies",
		DictIndexName:       "dicionario-cursos",
		IESDictIndexName:    "dicionario-ies",
		MunicipiosIndexName: "estados-municipios",
		JSONFilePath:        "/data/cursos.json",
		IESJSONFilePath:     "/data/ies.json",
		NumWorkers:          1,
		FlushBytes:          10_000,
		FlushIntervalSec:    1,
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

func TestEnsureDataIngereEmNovoIndiceEApontaAlias(t *testing.T) {
	var created, indexed, refreshed, aliasPointed int32
	var deletedOld int32
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/cursos-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodDelete:
			atomic.AddInt32(&deletedOld, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPut && r.URL.Path == "/cursos-"+testDate:
			atomic.AddInt32(&created, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			actions := testutil.CountBulkActions(string(body))
			atomic.AddInt32(&indexed, int32(actions))
			items := make([]string, actions)
			for i := range items {
				items[i] = `{"index":{"_index":"cursos-latest","status":201}}`
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"took":1,"errors":false,"items":[` + strings.Join(items, ",") + `]}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_refresh"):
			atomic.AddInt32(&refreshed, 1)
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodGet && r.URL.Path == "/_alias/cursos-latest":
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPost && r.URL.Path == "/_aliases":
			atomic.AddInt32(&aliasPointed, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
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

	if err := ensureData(context.Background(), client, testConfig(), spec, testDate); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if atomic.LoadInt32(&created) != 1 {
		t.Errorf("índice datado criado %d vezes, esperado 1", created)
	}
	if got := atomic.LoadInt32(&indexed); got != 2 {
		t.Errorf("documentos indexados = %d, esperado 2", got)
	}
	if atomic.LoadInt32(&refreshed) != 1 {
		t.Errorf("refresh chamado %d vezes, esperado 1", refreshed)
	}
	if atomic.LoadInt32(&aliasPointed) != 1 {
		t.Errorf("alias atualizado %d vezes, esperado 1", aliasPointed)
	}
	if atomic.LoadInt32(&deletedOld) != 0 {
		t.Errorf("nenhum índice antigo deveria ser apagado na primeira execução, obtido %d", deletedOld)
	}
}

func TestEnsureDataTrocaAliasEApagaIndiceAntigo(t *testing.T) {
	var deletedOld int32
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/cursos-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodDelete && r.URL.Path == "/cursos-2026-10-19":
			atomic.AddInt32(&deletedOld, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPut && r.URL.Path == "/cursos-"+testDate:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			actions := testutil.CountBulkActions(string(body))
			items := make([]string, actions)
			for i := range items {
				items[i] = `{"index":{"status":201}}`
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"took":1,"errors":false,"items":[` + strings.Join(items, ",") + `]}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_refresh"):
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodGet && r.URL.Path == "/_alias/cursos-latest":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"cursos-2026-10-19":{"aliases":{"cursos-latest":{}}}}`))
		case r.Method == http.MethodPost && r.URL.Path == "/_aliases":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
		}
	})

	stream := &sliceStream{docs: []bulk.Document{{ID: "1", Body: map[string]string{"no_curso": "DIREITO"}}}}
	spec := indexSpec{
		name:    "cursos",
		path:    "/data/cursos.json",
		mapping: []byte(`{"mappings":{}}`),
		open:    func(string) (bulk.Stream, error) { return stream, nil },
	}

	if err := ensureData(context.Background(), client, testConfig(), spec, testDate); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if atomic.LoadInt32(&deletedOld) != 1 {
		t.Errorf("índice antigo deveria ser apagado 1 vez, obtido %d", deletedOld)
	}
}

func TestEnsureDataNaoTrocaAliasQuandoIngestaoFalha(t *testing.T) {
	var refreshed, aliasListed, aliasPointed int32
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/cursos-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPut && r.URL.Path == "/cursos-"+testDate:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			actions := testutil.CountBulkActions(string(body))
			items := make([]string, actions)
			for i := range items {
				items[i] = `{"index":{"status":400,"error":{"type":"mapper_parsing_exception","reason":"boom"}}}`
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"took":1,"errors":true,"items":[` + strings.Join(items, ",") + `]}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_refresh"):
			atomic.AddInt32(&refreshed, 1)
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodGet && r.URL.Path == "/_alias/cursos-latest":
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

	stream := &sliceStream{docs: []bulk.Document{{ID: "1", Body: map[string]string{"no_curso": "DIREITO"}}}}
	spec := indexSpec{
		name:    "cursos",
		path:    "/data/cursos.json",
		mapping: []byte(`{"mappings":{}}`),
		open:    func(string) (bulk.Stream, error) { return stream, nil },
	}

	err := ensureData(context.Background(), client, testConfig(), spec, testDate)
	if err == nil || !strings.Contains(err.Error(), "rejeitado") {
		t.Fatalf("esperado erro de rejeição, obtido %v", err)
	}
	if atomic.LoadInt32(&refreshed) != 0 || atomic.LoadInt32(&aliasListed) != 0 || atomic.LoadInt32(&aliasPointed) != 0 {
		t.Errorf("após falha não deveria haver refresh nem troca de alias: refresh=%d alias=%d troca=%d",
			atomic.LoadInt32(&refreshed), atomic.LoadInt32(&aliasListed), atomic.LoadInt32(&aliasPointed))
	}
}

func TestEnsureDicionarioReconstroiSempre(t *testing.T) {
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

	spec := dictionary.Spec{
		SourceIndex: "cursos-latest",
		TargetIndex: "dicionario-cursos",
		SourceField: "curso.no_curso.keyword",
		DocField:    "no_curso",
		Mapping:     []byte(`{"mappings":{}}`),
	}

	if err := ensureDicionario(context.Background(), client, testConfig(), testDate, spec); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if atomic.LoadInt32(&created) != 1 {
		t.Errorf("dicionário criado %d vezes, esperado 1", created)
	}
	if atomic.LoadInt32(&refreshed) != 1 {
		t.Errorf("refresh chamado %d vezes, esperado 1", refreshed)
	}
	if atomic.LoadInt32(&aliasPointed) != 1 {
		t.Errorf("alias atualizado %d vezes, esperado 1", aliasPointed)
	}
}

func TestEnsureIESDicionarioIndexaNomeESigla(t *testing.T) {
	var capturedBulk string
	var aliasPointed int32
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/dicionario-ies-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPut && r.URL.Path == "/dicionario-ies-"+testDate:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			capturedBulk = string(body)
			actions := testutil.CountBulkActions(capturedBulk)
			items := make([]string, actions)
			for i := range items {
				items[i] = `{"index":{"status":201}}`
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"took":1,"errors":false,"items":[` + strings.Join(items, ",") + `]}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_refresh"):
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodGet && r.URL.Path == "/_alias/dicionario-ies-latest":
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPost && r.URL.Path == "/_aliases":
			atomic.AddInt32(&aliasPointed, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
		}
	})

	docs := map[string]ies.IES{
		"376": {CoIES: "376", NoIES: "UNIVERSIDADE DE SÃO PAULO", SgIES: "USP"},
	}

	if err := ensureIESDicionario(context.Background(), client, testConfig(), docs, testDate); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if !strings.Contains(capturedBulk, `"no_ies":"UNIVERSIDADE DE SÃO PAULO"`) {
		t.Errorf("bulk deveria conter o nome da IES, obtido %s", capturedBulk)
	}
	if !strings.Contains(capturedBulk, `"sg_ies":"USP"`) {
		t.Errorf("bulk deveria conter a sigla da IES, obtido %s", capturedBulk)
	}
	if atomic.LoadInt32(&aliasPointed) != 1 {
		t.Errorf("alias atualizado %d vezes, esperado 1", aliasPointed)
	}
}

func TestEnsureMunicipiosIndexaUmDocumentoPorUF(t *testing.T) {
	var searched, aliasPointed int32
	var capturedBulk string
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/estados-municipios-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPut && r.URL.Path == "/estados-municipios-"+testDate:
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_search"):
			atomic.AddInt32(&searched, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"aggregations":{"municipios":{"buckets":[
				{"key":{"uf":"SP","codigo":"3550308","nome":"São Paulo"}}
			]}}}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			capturedBulk = string(body)
			actions := testutil.CountBulkActions(capturedBulk)
			items := make([]string, actions)
			for i := range items {
				items[i] = `{"index":{"status":201}}`
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"took":1,"errors":false,"items":[` + strings.Join(items, ",") + `]}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_refresh"):
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodGet && r.URL.Path == "/_alias/estados-municipios-latest":
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPost && r.URL.Path == "/_aliases":
			atomic.AddInt32(&aliasPointed, 1)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
		}
	})

	if err := ensureMunicipios(context.Background(), client, testConfig(), testDate); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if atomic.LoadInt32(&searched) != 2 {
		t.Errorf("buscas de agregação = %d, esperado 2 (cursos e ies)", searched)
	}
	if !strings.Contains(capturedBulk, `"uf":"SP"`) || !strings.Contains(capturedBulk, `"codigo":"3550308"`) {
		t.Errorf("bulk deveria conter o município por UF, obtido %s", capturedBulk)
	}
	if atomic.LoadInt32(&aliasPointed) != 1 {
		t.Errorf("alias atualizado %d vezes, esperado 1", aliasPointed)
	}
}

func TestRunParaNaFalhaDeIngestaoDeCursosSemTocarNoRestante(t *testing.T) {
	var touchedOthers int32
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodDelete && r.URL.Path == "/cursos-"+testDate:
			w.WriteHeader(http.StatusNotFound)
		case r.Method == http.MethodPut && r.URL.Path == "/cursos-"+testDate:
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_bulk"):
			body, _ := io.ReadAll(r.Body)
			actions := testutil.CountBulkActions(string(body))
			items := make([]string, actions)
			for i := range items {
				items[i] = `{"index":{"status":400,"error":{"type":"mapper_parsing_exception","reason":"boom"}}}`
			}
			_, _ = w.Write([]byte(`{"took":1,"errors":true,"items":[` + strings.Join(items, ",") + `]}`))
		case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/_refresh"):
			w.WriteHeader(http.StatusOK)
		default:
			atomic.AddInt32(&touchedOthers, 1)
			w.WriteHeader(http.StatusOK)
		}
	})

	deps := defaultDeps()
	deps.Stat = func(string) error { return nil }
	deps.Now = func() time.Time { return time.Date(2026, 10, 20, 0, 0, 0, 0, time.UTC) }
	deps.NewClient = func(string, string) (*es.Client, error) { return client, nil }
	deps.LoadIES = func(string) (map[string]ies.IES, error) { return nil, nil }
	deps.OpenCursos = func(string, map[string]cursosingest.InstituicaoInfo) (bulk.Stream, error) {
		return &sliceStream{docs: []bulk.Document{{ID: "1", Body: map[string]string{"no_curso": "DIREITO"}}}}, nil
	}
	deps.OpenIES = func(string) (bulk.Stream, error) {
		t.Error("a ingestão de IES não deveria começar depois da falha em cursos")
		return nil, errors.New("não deveria abrir")
	}

	err := run(context.Background(), testConfig(), deps)
	if err == nil || !strings.Contains(err.Error(), "rejeitado") {
		t.Fatalf("esperado erro de rejeição, obtido %v", err)
	}
	if got := atomic.LoadInt32(&touchedOthers); got != 0 {
		t.Errorf("%d requisições a outros índices após a falha; esperado 0", got)
	}
}
