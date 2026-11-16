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

func mustSugestoesShould(t *testing.T, body map[string]any) []any {
	t.Helper()
	query, ok := body["query"].(map[string]any)
	if !ok {
		t.Fatalf("query ausente: %v", body)
	}
	boolQuery, ok := query["bool"].(map[string]any)
	if !ok {
		t.Fatalf("bool ausente: %v", query)
	}
	should, ok := boolQuery["should"].([]any)
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

	want := []Sugestao{{Nome: "DIREITO"}, {Nome: "MEDICINA"}}
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

	should := mustSugestoesShould(t, testutil.DecodeJSONObject(t, capturedBody))

	var exacto map[string]any
	hasBoolPrefix := false
	for _, clause := range should {
		clauseMap, _ := clause.(map[string]any)
		if term, ok := clauseMap["term"].(map[string]any); ok {
			if field, ok := term["no_curso.exato"].(map[string]any); ok {
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

func TestBuscarSugestoesMultiCampoConsultaSiglaEDevolveNome(t *testing.T) {
	var capturedBody string
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		capturedBody = string(raw)

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{
			"hits": {
				"total": {"value": 1},
				"hits": [{"_source": {"no_ies": "UNIVERSIDADE DE SÃO PAULO", "sg_ies": "USP"}}]
			}
		}`))
	})

	repo := NewElasticsearchRepository(client, "dicionario_ies", "no_ies", "sg_ies")
	got, err := repo.BuscarSugestoes(context.Background(), "usp", 8)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if !reflect.DeepEqual(got, []Sugestao{{Nome: "UNIVERSIDADE DE SÃO PAULO"}}) {
		t.Errorf("sugestões = %v, esperado [UNIVERSIDADE DE SÃO PAULO]", got)
	}

	should := mustSugestoesShould(t, testutil.DecodeJSONObject(t, capturedBody))

	exactFields := map[string]bool{}
	var multiFields []string
	for _, clause := range should {
		clauseMap, _ := clause.(map[string]any)
		if term, ok := clauseMap["term"].(map[string]any); ok {
			for field := range term {
				exactFields[field] = true
			}
		}
		if mm, ok := clauseMap["multi_match"].(map[string]any); ok {
			if fields, ok := mm["fields"].([]any); ok {
				for _, f := range fields {
					multiFields = append(multiFields, f.(string))
				}
			}
		}
	}

	if !exactFields["no_ies.exato"] || !exactFields["sg_ies.exato"] {
		t.Errorf("esperado match exato em no_ies.exato e sg_ies.exato, obtido %v", exactFields)
	}
	if !reflect.DeepEqual(multiFields, []string{"no_ies", "sg_ies"}) {
		t.Errorf("multi_match fields = %v, esperado [no_ies sg_ies]", multiFields)
	}
}

func TestBuscarSugestoesLeContagemDoDocumento(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{
			"hits": {
				"total": {"value": 1},
				"hits": [{"_source": {"no_curso": "DIREITO", "count": 42}}]
			}
		}`))
	})

	repo := NewElasticsearchRepository(client, "dicionario_cursos", "no_curso")
	got, err := repo.BuscarSugestoes(context.Background(), "dir", 8)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	want := []Sugestao{{Nome: "DIREITO", Count: 42}}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("sugestões = %v, esperado %v", got, want)
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
