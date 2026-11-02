package elasticsearch

import (
	"encoding/json"
	"reflect"
	"testing"
)

// roundTrip normaliza um valor para o formato decodificado do JSON, que é o que
// o Elasticsearch de fato recebe, evitando depender dos tipos Go concretos.
func roundTrip(t *testing.T, value any) any {
	t.Helper()
	raw, err := json.Marshal(value)
	if err != nil {
		t.Fatalf("serializar: %v", err)
	}
	var out any
	if err := json.Unmarshal(raw, &out); err != nil {
		t.Fatalf("decodificar: %v", err)
	}
	return out
}

func assertJSON(t *testing.T, got any, want string) {
	t.Helper()
	var wantValue any
	if err := json.Unmarshal([]byte(want), &wantValue); err != nil {
		t.Fatalf("esperado inválido: %v", err)
	}
	if gotValue := roundTrip(t, got); !reflect.DeepEqual(gotValue, wantValue) {
		t.Errorf("obtido %v, esperado %v", gotValue, wantValue)
	}
}

func TestTermsFilterMontaClausulaTerms(t *testing.T) {
	assertJSON(t, TermsFilter("regiao", []string{"Sul", "Norte"}),
		`{"terms": {"regiao": ["Sul", "Norte"]}}`)
}

func TestUpperTermsFilterPassaOsValoresParaMaiusculas(t *testing.T) {
	assertJSON(t, UpperTermsFilter("uf", []string{"sp", "Rj"}),
		`{"terms": {"uf": ["SP", "RJ"]}}`)
}

func TestUpperTermsFilterNaoAlteraOSliceRecebido(t *testing.T) {
	values := []string{"sp"}
	UpperTermsFilter("uf", values)
	if values[0] != "sp" {
		t.Errorf("o slice de entrada foi alterado: %v", values)
	}
}

func TestAnyOfExigeAoMenosUmaClausula(t *testing.T) {
	clauses := []map[string]any{
		{"term": map[string]any{"a": 1}},
		{"term": map[string]any{"b": 2}},
	}
	assertJSON(t, AnyOf(clauses), `{"bool": {
		"should": [{"term": {"a": 1}}, {"term": {"b": 2}}],
		"minimum_should_match": 1
	}}`)
}

func TestTermsAggMontaAgregacaoDeTermos(t *testing.T) {
	assertJSON(t, TermsAgg("uf", 30), `{"terms": {"field": "uf", "size": 30}}`)
}

func TestFiltersAggEmbrulhaOsFiltrosNomeados(t *testing.T) {
	named := map[string]any{"Gratuito": map[string]any{"term": map[string]any{"in_gratuito": true}}}
	assertJSON(t, FiltersAgg(named), `{"filters": {"filters": {
		"Gratuito": {"term": {"in_gratuito": true}}
	}}}`)
}

func TestCategoriaFilterTraduzOsRotulosDaUI(t *testing.T) {
	assertJSON(t, CategoriaFilter("categoria_administrativa", "Privada Sem Fins Lucrativos"),
		`{"terms": {"categoria_administrativa": ["Privada Sem Fins Lucrativos"]}}`)
}

func TestCategoriaFilterDevolveNilParaRotuloDesconhecido(t *testing.T) {
	if got := CategoriaFilter("categoria_administrativa", "inexistente"); got != nil {
		t.Errorf("esperado nil, obtido %v", got)
	}
}

func TestCategoriaAnyOfCombinaAsCategoriasConhecidas(t *testing.T) {
	got := CategoriaAnyOf("cat", []string{"pública federal", "inexistente", "pública estadual"})
	assertJSON(t, got, `{"bool": {
		"should": [
			{"terms": {"cat": ["Pública Federal"]}},
			{"terms": {"cat": ["Pública Estadual"]}}
		],
		"minimum_should_match": 1
	}}`)
}

func TestCategoriaAnyOfDevolveNilQuandoNenhumaCategoriaEConhecida(t *testing.T) {
	if got := CategoriaAnyOf("cat", []string{"inexistente"}); got != nil {
		t.Errorf("esperado nil, obtido %v", got)
	}
	if got := CategoriaAnyOf("cat", nil); got != nil {
		t.Errorf("esperado nil para entrada vazia, obtido %v", got)
	}
}

func TestCategoriasAggTemUmBucketPorCategoria(t *testing.T) {
	assertJSON(t, CategoriasAgg("cat"), `{"filters": {"filters": {
		"Privada Com Fins Lucrativos": {"terms": {"cat": ["Privada Com Fins Lucrativos"]}},
		"Privada Sem Fins Lucrativos": {"terms": {"cat": ["Privada Sem Fins Lucrativos"]}},
		"Pública Federal":             {"terms": {"cat": ["Pública Federal"]}},
		"Pública Estadual":            {"terms": {"cat": ["Pública Estadual"]}},
		"Pública Municipal":           {"terms": {"cat": ["Pública Municipal"]}}
	}}}`)
}

func TestSearchBodyMontaQueryPaginacaoOrdenacaoEAgregacoes(t *testing.T) {
	must := map[string]any{"match": map[string]any{"nome": "x"}}
	filters := []map[string]any{{"term": map[string]any{"uf": "SP"}}}
	sort := []map[string]any{{"_score": "desc"}}
	aggs := map[string]any{"ufs": TermsAgg("uf", 5)}

	assertJSON(t, SearchBody(must, filters, sort, aggs, 3, 20), `{
		"query": {"bool": {
			"must": {"match": {"nome": "x"}}
		}},
		"post_filter": {"bool": {"filter": [{"term": {"uf": "SP"}}]}},
		"size": 20,
		"from": 40,
		"sort": [{"_score": "desc"}],
		"aggs": {"ufs": {"terms": {"field": "uf", "size": 5}}}
	}`)
}

func TestSearchBodyOmiteOFiltroQuandoNaoHaClausulas(t *testing.T) {
	body := SearchBody(map[string]any{"match_all": map[string]any{}}, nil, nil, nil, 1, 10)

	if _, ok := body["post_filter"]; ok {
		t.Errorf("post_filter não deveria existir sem cláusulas: %v", body)
	}
	if body["from"] != 0 {
		t.Errorf("from = %v, esperado 0 na primeira página", body["from"])
	}
}
