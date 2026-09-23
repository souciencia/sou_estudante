package ies

import (
	"reflect"
	"testing"
)

// termsValues localiza, nas cláusulas de filtro, os valores de um campo terms.
func termsValues(t *testing.T, clauses []map[string]interface{}, field string) []string {
	t.Helper()
	for _, clause := range clauses {
		terms, ok := clause["terms"].(map[string]interface{})
		if !ok {
			continue
		}
		raw, ok := terms[field]
		if !ok {
			continue
		}
		values, ok := raw.([]string)
		if !ok {
			t.Fatalf("valores do campo %q não são []string: %T", field, raw)
		}
		return values
	}
	t.Fatalf("cláusula terms para o campo %q não encontrada em %v", field, clauses)
	return nil
}

func TestBuildQueryUsaMatchAllQuandoTermoVazio(t *testing.T) {
	built := buildQuery("")
	if _, ok := built["match_all"]; !ok {
		t.Fatalf("esperado match_all para termo vazio, obtido %v", built)
	}
}

func TestBuildQueryUsaTextoQuandoTermoPresente(t *testing.T) {
	built := buildQuery("UNIVERSIDADE FEDERAL")
	if _, ok := built["multi_match"]; !ok {
		t.Fatalf("esperado multi_match para termo presente, obtido %v", built)
	}
}

func TestBuildTextQueryExigeTodosOsTermosNoNomeESigla(t *testing.T) {
	query := "UNIVERSIDADE FEDERAL DO MATO GROSSO"
	built := buildTextQuery(query)

	multi, ok := built["multi_match"].(map[string]interface{})
	if !ok {
		t.Fatalf("esperado nó multi_match, obtido %T", built["multi_match"])
	}

	if operator := multi["operator"]; operator != "and" {
		t.Errorf("operator = %v, esperado %q", operator, "and")
	}

	wantFields := []string{"no_ies^3", "sg_ies^2"}
	if fields := multi["fields"]; !reflect.DeepEqual(fields, wantFields) {
		t.Errorf("fields = %v, esperado %v", fields, wantFields)
	}

	if fuzziness := multi["fuzziness"]; fuzziness != "AUTO" {
		t.Errorf("fuzziness = %v, esperado %q", fuzziness, "AUTO")
	}

	if got := multi["query"]; got != query {
		t.Errorf("query = %v, esperado %q", got, query)
	}
}

func TestBuildFilterClausesUsaCamposKeywordSemSufixo(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{
		UF:          []string{"sp"},
		Regiao:      []string{"Sudeste"},
		Organizacao: []string{"Universidade"},
	})

	if got := termsValues(t, clauses, "uf"); !reflect.DeepEqual(got, []string{"SP"}) {
		t.Errorf("uf = %v, esperado [SP] (maiúsculas)", got)
	}
	if got := termsValues(t, clauses, "regiao"); !reflect.DeepEqual(got, []string{"Sudeste"}) {
		t.Errorf("regiao = %v, esperado [Sudeste]", got)
	}
	if got := termsValues(t, clauses, "organizacao_academica"); !reflect.DeepEqual(got, []string{"Universidade"}) {
		t.Errorf("organizacao_academica = %v, esperado [Universidade]", got)
	}
}

func TestBuildFilterClausesEhVazioSemFiltros(t *testing.T) {
	if clauses := buildFilterClauses(SearchFilterParams{}); len(clauses) != 0 {
		t.Errorf("esperado nenhuma cláusula, obtido %v", clauses)
	}
}

func TestCategoriaFilterUsaCategoriaAdministrativa(t *testing.T) {
	built := categoriaFilter("Privada")

	terms, ok := built["terms"].(map[string]interface{})
	if !ok {
		t.Fatalf("esperado nó terms, obtido %T", built["terms"])
	}

	want := []string{"Privada com fins lucrativos", "Privada sem fins lucrativos"}
	if got := terms["categoria_administrativa"]; !reflect.DeepEqual(got, want) {
		t.Errorf("categoria_administrativa = %v, esperado %v", got, want)
	}
}

func TestCategoriaFilterIgnoraCategoriaDesconhecida(t *testing.T) {
	if clause := categoriaFilter("Especial"); clause != nil {
		t.Errorf("esperado nil para categoria desconhecida, obtido %v", clause)
	}
}

func TestBuildSortClausesUsaAlfabeticoPorPadrao(t *testing.T) {
	clauses := buildSortClauses("")
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula de ordenação, obtido %d", len(clauses))
	}
	if _, ok := clauses[0]["no_ies.keyword"]; !ok {
		t.Errorf("esperado ordenação por no_ies.keyword, obtido %v", clauses[0])
	}
}

func TestBuildSortClausesRelevanciaUsaScore(t *testing.T) {
	clauses := buildSortClauses("relevancia")
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula de ordenação, obtido %d", len(clauses))
	}
	if _, ok := clauses[0]["_score"]; !ok {
		t.Errorf("esperado ordenação por _score, obtido %v", clauses[0])
	}
}

func TestBuildAggregationsIncluiGruposDeFiltro(t *testing.T) {
	aggs := buildAggregations()

	for _, key := range []string{"ufs", "regioes", "organizacoes", "categorias"} {
		if _, ok := aggs[key]; !ok {
			t.Errorf("esperado agregação %q, obtido %v", key, aggs)
		}
	}
}
