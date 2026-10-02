package cursos

import (
	"reflect"
	"testing"
)

// buildTextQuery tem que exigir todos os termos digitados (operator "and")
// e buscar apenas em nome do curso e CINE, evitando que termos soltos
// (ex.: conectivos "de"/"e") correspondam ao índice inteiro.
func TestBuildTextQueryExigeTodosOsTermosNoNomeECINE(t *testing.T) {
	query := "CIÊNCIAS DA NATUREZA: CIÊNCIAS E QUÍMICA"
	built := buildTextQuery(query)

	multi, ok := built["multi_match"].(map[string]interface{})
	if !ok {
		t.Fatalf("esperado nó multi_match, obtido %T", built["multi_match"])
	}

	if operator := multi["operator"]; operator != "and" {
		t.Errorf("operator = %v, esperado %q", operator, "and")
	}

	wantFields := []string{"curso.no_curso^3", "curso.cine.no_cine_rotulo^2"}
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

// buildExactNameQuery tem que casar pelo campo "exato" (normalizer que
// ignora caixa e acentos) do nome do curso.
func TestBuildExactNameQueryCasaNomeIdêntico(t *testing.T) {
	built := buildExactNameQuery("MEDICINA VETERINARIA")

	term, ok := built["term"].(map[string]interface{})
	if !ok {
		t.Fatalf("esperado nó term, obtido %T", built["term"])
	}

	if field := term["curso.no_curso.exato"]; field != "MEDICINA VETERINARIA" {
		t.Errorf("curso.no_curso.exato = %v, esperado %q", field, "MEDICINA VETERINARIA")
	}
}

// categoriaFilter tem que filtrar pela categoria_administrativa real vinda da
// IES, e não mais pela heurística in_gratuito + sisu.
func TestCategoriaFilterUsaCategoriaAdministrativaDaIES(t *testing.T) {
	built := categoriaFilter("Privada")

	terms, ok := built["terms"].(map[string]interface{})
	if !ok {
		t.Fatalf("esperado nó terms, obtido %T", built["terms"])
	}

	want := []string{"Privada com fins lucrativos", "Privada sem fins lucrativos"}
	if got := terms["instituicao.categoria_administrativa"]; !reflect.DeepEqual(got, want) {
		t.Errorf("categoria_administrativa = %v, esperado %v", got, want)
	}
}

func TestCategoriaFilterIgnoraCategoriaDesconhecida(t *testing.T) {
	if clause := categoriaFilter("Especial"); clause != nil {
		t.Errorf("esperado nil para categoria desconhecida, obtido %v", clause)
	}
}

// Os campos agregados já são keyword no índice e NÃO possuem subcampo ".keyword".
// Referenciá-los com o sufixo resulta em campo inexistente e buckets vazios,
// sumindo com as contagens dos filtros da UI.
func TestBuildAggregationsUsaCamposKeywordSemSufixo(t *testing.T) {
	aggs := buildAggregations()

	want := map[string]string{
		"ufs":         "localizacao.sg_uf",
		"graus":       "curso.no_grau_academico",
		"modalidades": "curso.no_modalidade_ensino",
		"enades":      "enade.conceito_faixa_enade",
	}
	for group, field := range want {
		if got := termsAggField(t, aggs, group); got != field {
			t.Errorf("agregação %q usa field %q, esperado %q", group, got, field)
		}
	}
}

func TestBuildAggregationsIncluiTodosOsGrupos(t *testing.T) {
	aggs := buildAggregations()

	for _, key := range []string{"ufs", "graus", "modalidades", "enades", "categorias", "turnos"} {
		if _, ok := aggs[key]; !ok {
			t.Errorf("esperado agregação %q, obtido %v", key, aggs)
		}
	}
}

func TestBuildFilterClausesUFUsaCampoKeyword(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{UF: []string{"sp"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	terms := termsNodeFrom(t, clauses[0])
	if got := terms["localizacao.sg_uf"]; !reflect.DeepEqual(got, []string{"SP"}) {
		t.Errorf("localizacao.sg_uf = %v, esperado [SP]", got)
	}
}

func TestBuildFilterClausesEnadeUsaCampoKeyword(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Enade: []string{"Conceito 5"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	if _, ok := termsNodeFrom(t, clauses[0])["enade.conceito_faixa_enade"]; !ok {
		t.Errorf("esperado campo enade.conceito_faixa_enade, obtido %v", clauses[0])
	}
}

func TestBuildFilterClausesModalidadeEaDUsaCamposSemSufixo(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Modalidade: []string{"EaD"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	should := shouldClausesFrom(t, clauses[0])
	if len(should) != 2 {
		t.Fatalf("esperado 2 cláusulas should, obtido %d", len(should))
	}
	if _, ok := should[0]["term"].(map[string]interface{})["curso.tp_modalidade_ensino"]; !ok {
		t.Errorf("esperado campo curso.tp_modalidade_ensino, obtido %v", should[0])
	}
	if _, ok := should[1]["match"].(map[string]interface{})["curso.no_modalidade_ensino"]; !ok {
		t.Errorf("esperado campo curso.no_modalidade_ensino, obtido %v", should[1])
	}
}

func TestBuildSortClausesAzUsaNomeDoCursoKeyword(t *testing.T) {
	clauses := buildSortClauses("az")
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}
	if _, ok := clauses[0]["curso.no_curso.keyword"]; !ok {
		t.Errorf("esperado ordenação por curso.no_curso.keyword, obtido %v", clauses[0])
	}
}

func TestBuildSortClausesPadraoUsaScore(t *testing.T) {
	clauses := buildSortClauses("")
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}
	if _, ok := clauses[0]["_score"]; !ok {
		t.Errorf("esperado ordenação por _score, obtido %v", clauses[0])
	}
}

func termsAggField(t *testing.T, aggs map[string]interface{}, group string) string {
	t.Helper()

	agg, ok := aggs[group].(map[string]interface{})
	if !ok {
		t.Fatalf("agregação %q ausente ou com tipo inesperado: %v", group, aggs[group])
	}
	terms, ok := agg["terms"].(map[string]interface{})
	if !ok {
		t.Fatalf("agregação %q não é terms (%T)", group, agg["terms"])
	}
	field, _ := terms["field"].(string)
	return field
}

func termsNodeFrom(t *testing.T, clause map[string]interface{}) map[string]interface{} {
	t.Helper()

	terms, ok := clause["terms"].(map[string]interface{})
	if !ok {
		t.Fatalf("esperado nó terms, obtido %T", clause["terms"])
	}
	return terms
}

func shouldClausesFrom(t *testing.T, clause map[string]interface{}) []map[string]interface{} {
	t.Helper()

	boolNode, ok := clause["bool"].(map[string]interface{})
	if !ok {
		t.Fatalf("esperado nó bool, obtido %T", clause["bool"])
	}
	should, ok := boolNode["should"].([]map[string]interface{})
	if !ok {
		t.Fatalf("esperado should []map, obtido %T", boolNode["should"])
	}
	return should
}
