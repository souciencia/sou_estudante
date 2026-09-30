package sugestoes

import (
	"context"
	"io"
	"net/http"
	"reflect"
	"strings"
	"testing"

	"api_estudante/internal/testutil"
)

func TestBuscarSugestoesFazTrimEDedup(t *testing.T) {
	var capturedBody string
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		capturedBody = string(body)

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{
			"hits": {
				"total": {"value": 4},
				"hits": [
					{"_source": {"no_curso": " DIREITO "}},
					{"_source": {"no_curso": "DIREITO"}},
					{"_source": {"no_curso": "   "}},
					{"_source": {"no_curso": "MEDICINA"}}
				]
			}
		}`))
	})

	repo := NewElasticsearchRepository(client, "dicionario_cursos", "no_curso")
	got, err := repo.BuscarSugestoes(context.Background(), "dir", 8)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	want := []string{"DIREITO", "MEDICINA"}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("sugestões = %v, esperado %v", got, want)
	}

	if !strings.Contains(capturedBody, "bool_prefix") || !strings.Contains(capturedBody, "no_curso") {
		t.Errorf("query enviada inesperada: %s", capturedBody)
	}
}

func TestBuscarSugestoesRetornaErroEmFalha(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error": "boom"}`))
	})

	repo := NewElasticsearchRepository(client, "dicionario_cursos", "no_curso")
	if _, err := repo.BuscarSugestoes(context.Background(), "dir", 8); err == nil {
		t.Fatal("esperado erro para status 500")
	}
}
