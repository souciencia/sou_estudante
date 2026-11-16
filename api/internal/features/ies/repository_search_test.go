package ies

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"api_estudante/internal/testutil"
)

const iesSearchResponse = `{
	"hits": {
		"total": {"value": 1},
		"hits": [{"_source": {"co_ies": "376", "no_ies": "ANHANGUERA", "uf": "SP"}}]
	},
	"aggregations": {"ufs": {"termos": {"buckets": [{"key": "SP", "doc_count": 1}]}}}
}`

func TestParseAggregationsVazioEhNil(t *testing.T) {
	if got := parseAggregations(map[string]json.RawMessage{}); got != nil {
		t.Errorf("esperado nil para agregações vazias, obtido %+v", got)
	}
}

func TestParseAggregationsMapeiaBuckets(t *testing.T) {
	raw := map[string]json.RawMessage{
		"ufs":          json.RawMessage(`{"termos":{"buckets":[{"key":"SP","doc_count":7}]}}`),
		"municipios":   json.RawMessage(`{"termos":{"buckets":[{"key":"3550308","doc_count":3}]}}`),
		"regioes":      json.RawMessage(`{"termos":{"buckets":[{"key":"Sudeste","doc_count":5}]}}`),
		"categorias":   json.RawMessage(`{"termos":{"buckets":{"Pública Federal":{"doc_count":3}}}}`),
		"organizacoes": json.RawMessage(`{"termos":{"buckets":[{"key":"Universidade","doc_count":2}]}}`),
	}

	got := parseAggregations(raw)
	if got == nil {
		t.Fatal("esperado agregações, obtido nil")
	}
	if len(got.UFs) != 1 || got.UFs[0].Key != "SP" || got.UFs[0].Count != 7 {
		t.Errorf("ufs inesperadas: %+v", got.UFs)
	}
	if len(got.Municipios) != 1 || got.Municipios[0].Key != "3550308" || got.Municipios[0].Count != 3 {
		t.Errorf("municipios inesperados: %+v", got.Municipios)
	}
	if len(got.Regioes) != 1 || got.Regioes[0].Key != "Sudeste" {
		t.Errorf("regioes inesperadas: %+v", got.Regioes)
	}
	if len(got.Categorias) != 1 || got.Categorias[0].Key != "Pública Federal" {
		t.Errorf("categorias inesperadas: %+v", got.Categorias)
	}
	if len(got.Organizacoes) != 1 || got.Organizacoes[0].Key != "Universidade" {
		t.Errorf("organizacoes inesperadas: %+v", got.Organizacoes)
	}
}

func TestBuildFilterClausesCategoria(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Categoria: []string{"Pública Federal"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}
	boolNode, ok := clauses[0]["bool"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó bool, obtido %T", clauses[0]["bool"])
	}
	if should, ok := boolNode["should"].([]map[string]any); !ok || len(should) != 1 {
		t.Errorf("esperado 1 should de categoria, obtido %v", boolNode["should"])
	}
}

func TestBuildFilterClausesMunicipio(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Municipio: []string{"3550308"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}
	terms, ok := clauses[0]["terms"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó terms, obtido %T", clauses[0]["terms"])
	}
	if got := terms["localizacao.co_municipio"]; got == nil {
		t.Errorf("esperado filtro por localizacao.co_municipio, obtido %v", terms)
	}
}

func TestContextClausesExcluiFaceta(t *testing.T) {
	filters := SearchFilterParams{UF: []string{"SP"}, Municipio: []string{"3550308"}}
	all := buildFilterClauses(filters)
	ctx := contextClauses(filters, "municipio")

	if len(ctx) != len(all)-1 {
		t.Fatalf("contexto = %d cláusulas, esperado %d (todas menos município)", len(ctx), len(all)-1)
	}
	if len(ctx) != 1 {
		t.Fatalf("esperado 1 cláusula (UF), obtido %d", len(ctx))
	}
	if _, ok := ctx[0]["terms"].(map[string]any)["localizacao.sg_uf"]; !ok {
		t.Errorf("esperado cláusula de UF, obtido %v", ctx[0])
	}
}

func TestBuildAggregationsIncluiMunicipiosFiltrados(t *testing.T) {
	raw, ok := buildAggregations(SearchFilterParams{})["municipios"].(map[string]any)
	if !ok {
		t.Fatal("agregação municipios ausente")
	}

	if _, ok := raw["filter"].(map[string]any); !ok {
		t.Fatalf("municipios deveria ser filter agg, obtido %v", raw)
	}

	aggs, ok := raw["aggs"].(map[string]any)
	if !ok {
		t.Fatalf("filter agg sem aggs: %v", raw)
	}
	termos, ok := aggs["termos"].(map[string]any)
	if !ok {
		t.Fatalf("bucket interno termos ausente: %v", aggs)
	}
	terms, ok := termos["terms"].(map[string]any)
	if !ok {
		t.Fatalf("termos não é terms agg: %v", termos)
	}
	if terms["field"] != "localizacao.co_municipio" {
		t.Errorf("field = %v, esperado localizacao.co_municipio", terms["field"])
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

	repo := NewElasticsearchRepository(client, "ies")
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

func TestSearchRetornaErroEmFalha(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error":"boom"}`))
	})

	repo := NewElasticsearchRepository(client, "ies")
	if _, err := repo.Search(context.Background(), "anhanguera", SearchFilterParams{}, 1, 10); err == nil {
		t.Fatal("esperado erro para status 500")
	}
}

func TestGetByIDDecodificaIES(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"found":true,"_source":{"co_ies":"376","no_ies":"ANHANGUERA"}}`))
	})

	repo := NewElasticsearchRepository(client, "ies")
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

	repo := NewElasticsearchRepository(client, "ies")
	if _, err := repo.GetByID(context.Background(), "999"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("esperado ErrNotFound, obtido %v", err)
	}
}

func TestSearchUsaOIndiceConfigurado(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/ies_v2/_search" {
			t.Errorf("path = %q, esperado /ies_v2/_search", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(iesSearchResponse))
	})

	repo := NewElasticsearchRepository(client, "ies_v2")
	if _, err := repo.Search(context.Background(), "anhanguera", SearchFilterParams{}, 1, 10); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
}
