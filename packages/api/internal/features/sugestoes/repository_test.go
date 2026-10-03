package sugestoes

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"reflect"
	"strings"
	"testing"

	"api_estudante/internal/testutil"
)

func decodeSugestoesRequest(t *testing.T, raw string) map[string]interface{} {
	t.Helper()
	var body map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &body); err != nil {
		t.Fatalf("corpo da requisição inválido: %v (%s)", err, raw)
	}
	return body
}

func mustSugestoesShould(t *testing.T, body map[string]interface{}) []interface{} {
	t.Helper()
	query, ok := body["query"].(map[string]interface{})
	if !ok {
		t.Fatalf("query ausente: %v", body)
	}
	boolQuery, ok := query["bool"].(map[string]interface{})
	if !ok {
		t.Fatalf("bool ausente: %v", query)
	}
	should, ok := boolQuery["should"].([]interface{})
	if !ok || len(should) == 0 {
		t.Fatalf("should ausente: %v", boolQuery)
	}
	return should
}

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

func TestBuscarSugestoesPriorizaMatchExato(t *testing.T) {
	var capturedBody string
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		capturedBody = string(raw)

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{
			"hits": {
				"total": {"value": 1},
				"hits": [{"_source": {"no_curso": "ENGENHARIA"}}]
			}
		}`))
	})

	repo := NewElasticsearchRepository(client, "dicionario_cursos", "no_curso")
	if _, err := repo.BuscarSugestoes(context.Background(), "engenharia", 8); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	should := mustSugestoesShould(t, decodeSugestoesRequest(t, capturedBody))

	var exacto map[string]interface{}
	hasBoolPrefix := false
	for _, clause := range should {
		clauseMap, _ := clause.(map[string]interface{})
		if term, ok := clauseMap["term"].(map[string]interface{}); ok {
			if field, ok := term["no_curso.exato"].(map[string]interface{}); ok {
				exacto = field
			}
		}
		if _, ok := clauseMap["multi_match"]; ok {
			hasBoolPrefix = true
		}
	}

	if exacto == nil {
		t.Fatalf("esperado term em no_curso.exato nas cláusulas, obtido %v", should)
	}
	if exacto["value"] != "engenharia" {
		t.Errorf("value do match exato = %v, esperado engenharia", exacto["value"])
	}
	if boost, ok := exacto["boost"].(float64); !ok || boost <= 1 {
		t.Errorf("boost do match exato = %v, esperado > 1", exacto["boost"])
	}
	if !hasBoolPrefix {
		t.Errorf("esperado multi_match bool_prefix como fallback, obtido %v", should)
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
