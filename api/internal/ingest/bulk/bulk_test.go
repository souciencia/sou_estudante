package bulk

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync/atomic"
	"testing"

	"api_estudante/internal/config"
	"api_estudante/internal/testutil"
)

func testConfig() *config.Config {
	return &config.Config{NumWorkers: 1, FlushBytes: 10_000, FlushIntervalSec: 1}
}

// sliceStream implementa Stream sobre uma lista em memória.
type sliceStream struct {
	docs []Document
	next int
}

func (s *sliceStream) Next() (*Document, error) {
	if s.next >= len(s.docs) {
		return nil, io.EOF
	}
	doc := s.docs[s.next]
	s.next++
	return &doc, nil
}

func (s *sliceStream) Close() error { return nil }

func bulkHandler(t *testing.T, batches *int32) http.HandlerFunc {
	t.Helper()
	return func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		actions := testutil.CountBulkActions(string(body))
		if batches != nil {
			atomic.AddInt32(batches, 1)
		}

		items := make([]string, actions)
		for i := range items {
			items[i] = `{"index":{"_index":"cursos","status":201}}`
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = fmt.Fprintf(w, `{"took":1,"errors":false,"items":[%s]}`, strings.Join(items, ","))
	}
}

func TestRunIndexaTodosOsDocumentos(t *testing.T) {
	var batches int32
	client := testutil.NewESClient(t, bulkHandler(t, &batches))

	stream := &sliceStream{docs: []Document{
		{ID: "1", Body: map[string]string{"no_curso": "DIREITO"}},
		{ID: "2", Body: map[string]string{"no_curso": "MEDICINA"}},
		{ID: "3", Body: map[string]string{"no_curso": "FÍSICA"}},
	}}

	indexed, err := Run(context.Background(), client, "cursos", testConfig(), stream)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if indexed != 3 {
		t.Errorf("indexados = %d, esperado 3", indexed)
	}
	if atomic.LoadInt32(&batches) == 0 {
		t.Error("nenhuma requisição de bulk foi enviada")
	}
}

func TestNewItemIgnoraCorpoNaoSerializavel(t *testing.T) {
	var indexed, failed uint64

	if _, err := newItem(Document{Body: make(chan int)}, &indexed, &failed); err == nil {
		t.Fatal("esperado erro ao serializar corpo inválido")
	}
}

func TestNewItemDefineDocumentID(t *testing.T) {
	var indexed, failed uint64

	item, err := newItem(Document{ID: "42", Body: map[string]string{"k": "v"}}, &indexed, &failed)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if item.Action != "index" {
		t.Errorf("action = %q, esperado index", item.Action)
	}
	if item.DocumentID != "42" {
		t.Errorf("documentID = %q, esperado 42", item.DocumentID)
	}
}

func TestCreateRetornaErroEmFalha(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error":"bad"}`))
	})

	if err := Create(context.Background(), client, "cursos", []byte(`{}`)); err == nil {
		t.Fatal("esperado erro ao criar índice com status 400")
	}
}

func TestDeleteIgnoraAusencia(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	})

	if err := Delete(context.Background(), client, "cursos"); err != nil {
		t.Fatalf("404 deveria ser ignorado, obtido %v", err)
	}
}

func TestCreateComSucesso(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"acknowledged":true}`))
	})

	if err := Create(context.Background(), client, "cursos", []byte(`{"mappings":{}}`)); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
}

func TestRefreshRetornaErroEmFalha(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error":"boom"}`))
	})

	if err := Refresh(context.Background(), client, "cursos"); err == nil {
		t.Fatal("esperado erro para refresh com status 500")
	}
}

type scriptedItem struct {
	doc *Document
	err error
}

// scriptedStream devolve uma sequência controlada de itens, permitindo simular
// erros pontuais de leitura.
type scriptedStream struct {
	items []scriptedItem
	next  int
}

func (s *scriptedStream) Next() (*Document, error) {
	if s.next >= len(s.items) {
		return nil, io.EOF
	}
	item := s.items[s.next]
	s.next++
	return item.doc, item.err
}

func (s *scriptedStream) Close() error { return nil }

func TestRunRetornaErroQuandoHaRejeicoes(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		actions := testutil.CountBulkActions(string(body))
		items := make([]string, actions)
		for i := range items {
			items[i] = `{"index":{"status":201}}`
		}
		items[actions-1] = `{"index":{"status":400,"error":{"type":"mapper_parsing_exception","reason":"boom"}}}`
		w.Header().Set("Content-Type", "application/json")
		_, _ = fmt.Fprintf(w, `{"took":1,"errors":true,"items":[%s]}`, strings.Join(items, ","))
	})

	stream := &sliceStream{docs: []Document{
		{ID: "1", Body: map[string]string{"no_curso": "DIREITO"}},
		{ID: "2", Body: map[string]string{"no_curso": "MEDICINA"}},
	}}

	indexed, err := Run(context.Background(), client, "cursos", testConfig(), stream)
	if err == nil || !strings.Contains(err.Error(), "rejeitado") {
		t.Fatalf("esperado erro de rejeição, obtido %v", err)
	}
	if indexed != 1 {
		t.Errorf("indexados = %d, esperado 1", indexed)
	}
}

func TestRunRespeitaCancelamentoDeContexto(t *testing.T) {
	client := testutil.NewESClient(t, func(http.ResponseWriter, *http.Request) {})

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	stream := &sliceStream{docs: []Document{{ID: "1", Body: map[string]string{"k": "v"}}}}
	if _, err := Run(ctx, client, "cursos", testConfig(), stream); !errors.Is(err, context.Canceled) {
		t.Fatalf("esperado context.Canceled, obtido %v", err)
	}
}

func TestRunIgnoraErroDeStreamEProssegue(t *testing.T) {
	client := testutil.NewESClient(t, bulkHandler(t, nil))

	stream := &scriptedStream{items: []scriptedItem{
		{doc: nil, err: errors.New("registro corrompido")},
		{doc: &Document{ID: "1", Body: map[string]string{"no_curso": "DIREITO"}}},
	}}

	indexed, err := Run(context.Background(), client, "cursos", testConfig(), stream)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if indexed != 1 {
		t.Errorf("indexados = %d, esperado 1", indexed)
	}
}

// failingStream devolve sempre o mesmo erro, como um decoder JSON que repete
// um erro de sintaxe a cada chamada.
type failingStream struct {
	calls int
}

func (s *failingStream) Next() (*Document, error) {
	s.calls++
	if s.calls > 10_000 {
		return nil, io.EOF // evita travar o teste se a proteção não existir
	}
	return nil, errors.New("invalid character 'x'")
}

func (s *failingStream) Close() error { return nil }

func TestRunAbortaAposErrosConsecutivosDeLeitura(t *testing.T) {
	client := testutil.NewESClient(t, bulkHandler(t, nil))
	stream := &failingStream{}

	_, err := Run(context.Background(), client, "cursos", testConfig(), stream)
	if err == nil {
		t.Fatal("esperado erro após erros consecutivos de leitura, obtido nil")
	}
	if stream.calls > maxConsecutiveReadErrors+1 {
		t.Errorf("Next chamado %d vezes; esperado parar perto de %d", stream.calls, maxConsecutiveReadErrors)
	}
}

func TestRunZeraContadorDeErrosAoLerComSucesso(t *testing.T) {
	client := testutil.NewESClient(t, bulkHandler(t, nil))

	var items []scriptedItem
	for i := 0; i < 3; i++ {
		for j := 0; j < maxConsecutiveReadErrors-1; j++ {
			items = append(items, scriptedItem{err: errors.New("registro corrompido")})
		}
		items = append(items, scriptedItem{doc: &Document{ID: fmt.Sprint(i), Body: map[string]string{"k": "v"}}})
	}

	indexed, err := Run(context.Background(), client, "cursos", testConfig(), &scriptedStream{items: items})
	if err != nil {
		t.Fatalf("erros isolados não devem abortar: %v", err)
	}
	if indexed != 3 {
		t.Errorf("indexados = %d, esperado 3", indexed)
	}
}
