package cursos

import (
	"context"
	"errors"
	"io"
	"net/http"
	"testing"

	"api_estudante/internal/testutil"
)

const cursosSearchResponse = `{
	"hits": {
		"total": {"value": 1},
		"hits": [{"_source": {"sequencial": 1, "curso": {"no_curso": "MEDICINA"}}}]
	},
	"aggregations": {"ufs": {"termos": {"buckets": [{"key": "SP", "doc_count": 1}]}}}
}`

func TestSearchDecodificaHitsEAgregacoes(t *testing.T) {
	var requests int
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		requests++
		if r.URL.Path != "/cursos/_search" {
			t.Errorf("path = %q, esperado /cursos/_search", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(cursosSearchResponse))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	result, err := repo.Search(context.Background(), "medicina", SearchFilterParams{}, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if result.Total != 1 {
		t.Errorf("total = %d, esperado 1", result.Total)
	}
	if len(result.Hits) != 1 || result.Hits[0].Curso.NoCurso != "MEDICINA" {
		t.Errorf("hits inesperados: %+v", result.Hits)
	}
	if result.Aggregations == nil || len(result.Aggregations.UFs) != 1 || result.Aggregations.UFs[0].Key != "SP" {
		t.Errorf("agregações inesperadas: %+v", result.Aggregations)
	}
	if requests != 1 {
		t.Errorf("requisições = %d, esperado 1", requests)
	}
}

func TestSearchDecodificaAgregacaoDeMunicipios(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"hits":{"total":{"value":0},"hits":[]},"aggregations":{"municipios":{"termos":{"buckets":[{"key":"3550308","doc_count":3},{"key":"3509502","doc_count":1}]}}}}`))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	result, err := repo.Search(context.Background(), "medicina", SearchFilterParams{}, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if result.Aggregations == nil || len(result.Aggregations.Municipios) != 2 {
		t.Fatalf("municípios inesperados: %+v", result.Aggregations)
	}
	if result.Aggregations.Municipios[0].Key != "3550308" || result.Aggregations.Municipios[0].Count != 3 {
		t.Errorf("primeiro município inesperado: %+v", result.Aggregations.Municipios[0])
	}
}

func TestBuildAggregationsIncluiMunicipiosFiltrados(t *testing.T) {
	raw, ok := buildAggregations(SearchFilterParams{UF: []string{"SP"}})["municipios"].(map[string]any)
	if !ok {
		t.Fatal("agregação municipios ausente")
	}

	filter, ok := raw["filter"].(map[string]any)
	if !ok {
		t.Fatalf("municipios deveria ser filter agg, obtido %v", raw)
	}
	boolNode, ok := filter["bool"].(map[string]any)
	if !ok {
		t.Fatalf("filter agg sem nó bool: %v", filter)
	}
	// O contexto de municipios inclui a UF ativa (excluindo o próprio município).
	ctxClauses, ok := boolNode["filter"].([]map[string]any)
	if !ok || len(ctxClauses) != 1 {
		t.Fatalf("esperado 1 cláusula de contexto (UF), obtido %v", boolNode["filter"])
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

func TestSearchEnviaPaginacaoOrdenacaoEFiltros(t *testing.T) {
	var body map[string]any
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		body = testutil.DecodeJSONObject(t, string(raw))
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"hits":{"total":{"value":0},"hits":[]}}`))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	_, err := repo.Search(context.Background(), "medicina", SearchFilterParams{Sort: "az", UF: []string{"sp"}}, 2, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if from := body["from"]; from != float64(10) {
		t.Errorf("from = %v, esperado 10", from)
	}
	if size := body["size"]; size != float64(10) {
		t.Errorf("size = %v, esperado 10", size)
	}

	sort, ok := body["sort"].([]any)
	if !ok || len(sort) != 1 {
		t.Fatalf("sort inesperado: %v", body["sort"])
	}
	if _, ok := sort[0].(map[string]any)["curso.no_curso.keyword"]; !ok {
		t.Errorf("sort não usa curso.no_curso.keyword: %v", sort[0])
	}

	filter := mustFilter(t, body)
	if got := filter[0]["terms"].(map[string]any)["localizacao.sg_uf"]; got == nil {
		t.Errorf("filtro de UF ausente: %v", filter)
	}
}

func TestSearchEnviaFiltroDeMunicipio(t *testing.T) {
	var body map[string]any
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		body = testutil.DecodeJSONObject(t, string(raw))
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"hits":{"total":{"value":0},"hits":[]}}`))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	_, err := repo.Search(context.Background(), "medicina", SearchFilterParams{Municipio: []string{"3550308", "3304557"}}, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	filter := mustFilter(t, body)
	terms := filter[0]["terms"].(map[string]any)["localizacao.co_municipio"]
	if terms == nil {
		t.Errorf("filtro de município ausente: %v", filter)
	}
}

func TestSearchExactUsaTermQuandoNomeExiste(t *testing.T) {
	var bodies []map[string]any
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		body := testutil.DecodeJSONObject(t, string(raw))
		bodies = append(bodies, body)

		w.Header().Set("Content-Type", "application/json")
		if body["size"] == float64(0) {
			_, _ = w.Write([]byte(`{"hits":{"total":{"value":1},"hits":[]}}`))
			return
		}
		_, _ = w.Write([]byte(cursosSearchResponse))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	if _, err := repo.Search(context.Background(), "MEDICINA", SearchFilterParams{Exact: true}, 1, 10); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if len(bodies) != 2 {
		t.Fatalf("requisições = %d, esperado 2 (probe + busca)", len(bodies))
	}
	must := mustQuery(t, bodies[1])
	if _, ok := must["term"].(map[string]any); !ok {
		t.Errorf("esperado nó term para nome exato, obtido %v", must)
	}
}

func TestSearchExactMantemMultiMatchQuandoNomeNaoExiste(t *testing.T) {
	var bodies []map[string]any
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		body := testutil.DecodeJSONObject(t, string(raw))
		bodies = append(bodies, body)

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"hits":{"total":{"value":0},"hits":[]}}`))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	if _, err := repo.Search(context.Background(), "MEDICIN", SearchFilterParams{Exact: true}, 1, 10); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if len(bodies) != 2 {
		t.Fatalf("requisições = %d, esperado 2 (probe + busca)", len(bodies))
	}
	if _, ok := mustQuery(t, bodies[1])["multi_match"]; !ok {
		t.Errorf("esperado multi_match quando não há nome exato, obtido %v", mustQuery(t, bodies[1]))
	}
}

func TestSearchSemExactNaoFazProbe(t *testing.T) {
	var bodies []map[string]any
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		bodies = append(bodies, testutil.DecodeJSONObject(t, string(raw)))
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"hits":{"total":{"value":0},"hits":[]}}`))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	if _, err := repo.Search(context.Background(), "medicina", SearchFilterParams{}, 1, 10); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if len(bodies) != 1 {
		t.Errorf("requisições = %d, esperado 1", len(bodies))
	}
}

func TestSearchSemAgregacoesDeixaNil(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"hits":{"total":{"value":0},"hits":[]}}`))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	result, err := repo.Search(context.Background(), "medicina", SearchFilterParams{}, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if result.Aggregations != nil {
		t.Errorf("agregações deveriam ser nil, obtido %+v", result.Aggregations)
	}
}

func TestSearchRetornaErroEmFalha(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error":"boom"}`))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	if _, err := repo.Search(context.Background(), "medicina", SearchFilterParams{}, 1, 10); err == nil {
		t.Fatal("esperado erro para status 500")
	}
}

func TestGetByIDDecodificaCurso(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"found":true,"_source":{"sequencial":1,"curso":{"no_curso":"MEDICINA"}}}`))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	curso, err := repo.GetByID(context.Background(), "1")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if curso.Curso.NoCurso != "MEDICINA" {
		t.Errorf("curso = %+v, esperado MEDICINA", curso.Curso)
	}
}

func TestGetByIDRetornaErrNotFound(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte(`{"found":false}`))
	})

	repo := NewElasticsearchRepository(client, "cursos")
	if _, err := repo.GetByID(context.Background(), "999"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("esperado ErrNotFound, obtido %v", err)
	}
}

func mustFilter(t *testing.T, body map[string]any) []map[string]any {
	t.Helper()
	postFilter, ok := body["post_filter"].(map[string]any)
	if !ok {
		t.Fatalf("esperado bloco post_filter, obtido %v", body["post_filter"])
	}
	boolQuery, ok := postFilter["bool"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó bool no post_filter, obtido %v", postFilter["bool"])
	}
	raw, ok := boolQuery["filter"].([]any)
	if !ok {
		t.Fatalf("esperado bloco filter, obtido %v", boolQuery["filter"])
	}
	filter := make([]map[string]any, 0, len(raw))
	for _, item := range raw {
		filter = append(filter, item.(map[string]any))
	}
	return filter
}

func mustQuery(t *testing.T, body map[string]any) map[string]any {
	t.Helper()
	query := body["query"].(map[string]any)
	boolQuery := query["bool"].(map[string]any)
	must, ok := boolQuery["must"].(map[string]any)
	if !ok {
		t.Fatalf("esperado bloco must, obtido %v", boolQuery["must"])
	}
	return must
}

func TestSearchUsaOIndiceConfigurado(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/cursos_v2/_search" {
			t.Errorf("path = %q, esperado /cursos_v2/_search", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(cursosSearchResponse))
	})

	repo := NewElasticsearchRepository(client, "cursos_v2")
	if _, err := repo.Search(context.Background(), "medicina", SearchFilterParams{}, 1, 10); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
}
