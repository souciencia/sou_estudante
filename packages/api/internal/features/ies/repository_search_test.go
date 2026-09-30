package ies

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"testing"

	"api_estudante/internal/testutil"
)

const iesSearchResponse = `{
	"hits": {
		"total": {"value": 1},
		"hits": [{"_source": {"co_ies": "376", "no_ies": "ANHANGUERA", "uf": "SP"}}]
	},
	"aggregations": {"ufs": {"buckets": [{"key": "SP", "doc_count": 1}]}}
}`

func decodeRequest(t *testing.T, raw string) map[string]interface{} {
	t.Helper()
	var body map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &body); err != nil {
		t.Fatalf("corpo da requisição inválido: %v (%s)", err, raw)
	}
	return body
}

func TestParseAggregationsVazioEhNil(t *testing.T) {
	if got := parseAggregations(map[string]json.RawMessage{}); got != nil {
		t.Errorf("esperado nil para agregações vazias, obtido %+v", got)
	}
}

func TestParseAggregationsMapeiaBuckets(t *testing.T) {
	raw := map[string]json.RawMessage{
		"ufs":          json.RawMessage(`{"buckets":[{"key":"SP","doc_count":7}]}`),
		"regioes":      json.RawMessage(`{"buckets":[{"key":"Sudeste","doc_count":5}]}`),
		"categorias":   json.RawMessage(`{"buckets":{"Privada":{"doc_count":3}}}`),
		"organizacoes": json.RawMessage(`{"buckets":[{"key":"Universidade","doc_count":2}]}`),
	}

	got := parseAggregations(raw)
	if got == nil {
		t.Fatal("esperado agregações, obtido nil")
	}
	if len(got.UFs) != 1 || got.UFs[0].Key != "SP" || got.UFs[0].Count != 7 {
		t.Errorf("ufs inesperadas: %+v", got.UFs)
	}
	if len(got.Regioes) != 1 || got.Regioes[0].Key != "Sudeste" {
		t.Errorf("regioes inesperadas: %+v", got.Regioes)
	}
	if len(got.Categorias) != 1 || got.Categorias[0].Key != "Privada" {
		t.Errorf("categorias inesperadas: %+v", got.Categorias)
	}
	if len(got.Organizacoes) != 1 || got.Organizacoes[0].Key != "Universidade" {
		t.Errorf("organizacoes inesperadas: %+v", got.Organizacoes)
	}
}

func TestBuildFilterClausesCategoria(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Categoria: []string{"Privada"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}
	boolNode, ok := clauses[0]["bool"].(map[string]interface{})
	if !ok {
		t.Fatalf("esperado nó bool, obtido %T", clauses[0]["bool"])
	}
	if should, ok := boolNode["should"].([]map[string]interface{}); !ok || len(should) != 1 {
		t.Errorf("esperado 1 should de categoria, obtido %v", boolNode["should"])
	}
}

func TestBuildSortClausesAceitaAliasScore(t *testing.T) {
	clauses := buildSortClauses("_score")
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}
	if _, ok := clauses[0]["_score"]; !ok {
		t.Errorf("esperado ordenação por _score, obtido %v", clauses[0])
	}
}

func TestSearchDecodificaHitsEAgregacoes(t *testing.T) {
	var requests int
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		requests++
		if r.URL.Path != "/ies/_search" {
			t.Errorf("path = %q, esperado /ies/_search", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(iesSearchResponse))
	})

	repo := NewElasticsearchRepository(client)
	result, err := repo.Search(context.Background(), "anhanguera", SearchFilterParams{}, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if result.Total != 1 {
		t.Errorf("total = %d, esperado 1", result.Total)
	}
	if len(result.Hits) != 1 || result.Hits[0].NoIES != "ANHANGUERA" {
		t.Errorf("hits inesperados: %+v", result.Hits)
	}
	if result.Aggregations == nil || len(result.Aggregations.UFs) != 1 {
		t.Errorf("agregações inesperadas: %+v", result.Aggregations)
	}
	if requests != 1 {
		t.Errorf("requisições = %d, esperado 1", requests)
	}
}

func TestSearchTermoVazioUsaMatchAll(t *testing.T) {
	var body map[string]interface{}
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		body = decodeRequest(t, string(raw))
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"hits":{"total":{"value":0},"hits":[]}}`))
	})

	repo := NewElasticsearchRepository(client)
	if _, err := repo.Search(context.Background(), "   ", SearchFilterParams{}, 1, 10); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	must := body["query"].(map[string]interface{})["bool"].(map[string]interface{})["must"].(map[string]interface{})
	if _, ok := must["match_all"]; !ok {
		t.Errorf("esperado match_all, obtido %v", must)
	}
}

func TestSearchRetornaErroEmFalha(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error":"boom"}`))
	})

	repo := NewElasticsearchRepository(client)
	if _, err := repo.Search(context.Background(), "anhanguera", SearchFilterParams{}, 1, 10); err == nil {
		t.Fatal("esperado erro para status 500")
	}
}

func TestGetByIDDecodificaIES(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"found":true,"_source":{"co_ies":"376","no_ies":"ANHANGUERA"}}`))
	})

	repo := NewElasticsearchRepository(client)
	iesDoc, err := repo.GetByID(context.Background(), "376")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if iesDoc.NoIES != "ANHANGUERA" {
		t.Errorf("ies = %+v, esperado ANHANGUERA", iesDoc)
	}
}

func TestGetByIDRetornaErrNotFound(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte(`{"found":false}`))
	})

	repo := NewElasticsearchRepository(client)
	if _, err := repo.GetByID(context.Background(), "999"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("esperado ErrNotFound, obtido %v", err)
	}
}
