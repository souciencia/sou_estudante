package bulk

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"

	"api_estudante/internal/testutil"
)

func TestAliasIndicesListaOsIndicesConcretosOrdenados(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet && r.URL.Path == "/_alias/cursos" {
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"cursos-b":{"aliases":{"cursos":{}}},"cursos-a":{"aliases":{"cursos":{}}}}`))
			return
		}
		t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
	})

	indices, err := AliasIndices(context.Background(), client, "cursos")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if len(indices) != 2 || indices[0] != "cursos-a" || indices[1] != "cursos-b" {
		t.Errorf("AliasIndices = %v, esperado [cursos-a cursos-b]", indices)
	}
}

func TestAliasIndicesDevolveVazioQuandoAliasNaoExiste(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet && r.URL.Path == "/_alias/cursos" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
	})

	indices, err := AliasIndices(context.Background(), client, "cursos")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if indices != nil {
		t.Errorf("AliasIndices = %v, esperado nil", indices)
	}
}

func TestPointAliasRemoveOsAntigosEAdicionaONovo(t *testing.T) {
	var body map[string]any
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost && r.URL.Path == "/_aliases" {
			raw, _ := io.ReadAll(r.Body)
			if err := json.Unmarshal(raw, &body); err != nil {
				t.Fatalf("corpo inválido: %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
			return
		}
		t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
	})

	if err := PointAlias(context.Background(), client, "cursos", "cursos-latest", []string{"cursos-antigo"}); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	actions, ok := body["actions"].([]any)
	if !ok || len(actions) != 2 {
		t.Fatalf("ações inesperadas: %v", body)
	}
	remove := actions[0].(map[string]any)["remove"].(map[string]any)
	if remove["index"] != "cursos-antigo" || remove["alias"] != "cursos" {
		t.Errorf("remove inesperado: %v", remove)
	}
	add := actions[1].(map[string]any)["add"].(map[string]any)
	if add["index"] != "cursos-latest" || add["alias"] != "cursos" {
		t.Errorf("add inesperado: %v", add)
	}
}

func TestPointAliasSemAntigosSoAdiciona(t *testing.T) {
	var body map[string]any
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost && r.URL.Path == "/_aliases" {
			raw, _ := io.ReadAll(r.Body)
			if err := json.Unmarshal(raw, &body); err != nil {
				t.Fatalf("corpo inválido: %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"acknowledged":true}`))
			return
		}
		t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
	})

	if err := PointAlias(context.Background(), client, "cursos", "cursos-latest", nil); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	actions := body["actions"].([]any)
	if len(actions) != 1 {
		t.Fatalf("esperado 1 ação, obtido %d", len(actions))
	}
	add := actions[0].(map[string]any)["add"].(map[string]any)
	if add["index"] != "cursos-latest" || add["alias"] != "cursos" {
		t.Errorf("add inesperado: %v", add)
	}
	if strings.Contains(string(mustJSON(t, body)), "remove") {
		t.Errorf("não deveria haver remove sem índices antigos: %v", body)
	}
}

func mustJSON(t *testing.T, v any) []byte {
	t.Helper()
	raw, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("serializar: %v", err)
	}
	return raw
}
