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

	multi, ok := built["multi_match"].(map[string]any)
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

	term, ok := built["term"].(map[string]any)
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
	built := categoriaFilter("Privada Sem Fins Lucrativos")

	terms, ok := built["terms"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó terms, obtido %T", built["terms"])
	}

	want := []string{"Privada Sem Fins Lucrativos"}
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
	}
	for group, field := range want {
		if got := termsAggField(t, aggs, group); got != field {
			t.Errorf("agregação %q usa field %q, esperado %q", group, got, field)
		}
	}
}

func TestBuildAggregationsIncluiTodosOsGrupos(t *testing.T) {
	aggs := buildAggregations()

	for _, key := range []string{"ufs", "graus", "modalidades", "enades", "categorias", "turnos", "ingresso"} {
		if _, ok := aggs[key]; !ok {
			t.Errorf("esperado agregação %q, obtido %v", key, aggs)
		}
	}
}

// O conceito Enade agrega faixas (1-5, SC) e a ausência de avaliação no ciclo.
func TestBuildAggregationsEnadeIncluiFaixasEAusencia(t *testing.T) {
	aggs := buildAggregations()

	filters := filtersBuckets(t, aggs, "enades")
	for _, key := range []string{"1", "2", "3", "4", "5", "SC", "Sem avaliação no Ciclo"} {
		if _, ok := filters[key]; !ok {
			t.Errorf("esperado bucket %q na agregação enades, obtido %v", key, filters)
		}
	}
}

// A contagem de gratuito deve usar o campo booleano curso.in_gratuito.
func TestBuildAggregationsIngressoGratuitoFiltraInGratuito(t *testing.T) {
	aggs := buildAggregations()

	filters := filtersBuckets(t, aggs, "ingresso")
	gratuito, ok := filters["gratuito"].(map[string]any)
	if !ok {
		t.Fatalf("esperado bucket gratuito, obtido %v", filters)
	}
	term, ok := gratuito["term"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó term, obtido %v", gratuito)
	}
	if got := term["curso.in_gratuito"]; got != true {
		t.Errorf("curso.in_gratuito = %v, esperado true", got)
	}
}

// A contagem de com vagas Sisu deve usar o campo booleano sisu.tem_sisu.
func TestBuildAggregationsIngressoSisuFiltraTemSisu(t *testing.T) {
	aggs := buildAggregations()

	filters := filtersBuckets(t, aggs, "ingresso")
	viaSisu, ok := filters["sisu"].(map[string]any)
	if !ok {
		t.Fatalf("esperado bucket sisu, obtido %v", filters)
	}
	term, ok := viaSisu["term"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó term, obtido %v", viaSisu)
	}
	if got := term["sisu.tem_sisu"]; got != true {
		t.Errorf("sisu.tem_sisu = %v, esperado true", got)
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
	clauses := buildFilterClauses(SearchFilterParams{Enade: []string{"5"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	should := shouldClausesFrom(t, clauses[0])
	if len(should) != 1 {
		t.Fatalf("esperado 1 cláusula should, obtido %d", len(should))
	}
	if _, ok := termsNodeFrom(t, should[0])["enade.conceito_faixa_enade"]; !ok {
		t.Errorf("esperado campo enade.conceito_faixa_enade, obtido %v", should[0])
	}
}

// "Sem avaliação no Ciclo" filtra cursos cuja faixa do Enade está ausente.
func TestBuildFilterClausesEnadeSemAvaliacaoNoCiclo(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Enade: []string{"Sem avaliação no Ciclo"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	should := shouldClausesFrom(t, clauses[0])
	if len(should) != 1 {
		t.Fatalf("esperado 1 cláusula should, obtido %d", len(should))
	}
	boolNode, ok := should[0]["bool"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó bool, obtido %T", should[0]["bool"])
	}
	if mustNot, ok := boolNode["must_not"]; !ok || mustNot == nil {
		t.Errorf("esperado must_not para ausência do Enade, obtido %v", boolNode)
	}
}

func TestBuildFilterClausesIngressoSisuFiltraTemSisu(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Ingresso: []string{"sisu"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	should := shouldClausesFrom(t, clauses[0])
	if len(should) != 1 {
		t.Fatalf("esperado 1 cláusula should, obtido %d", len(should))
	}
	term, ok := should[0]["term"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó term, obtido %T", should[0]["term"])
	}
	if got := term["sisu.tem_sisu"]; got != true {
		t.Errorf("sisu.tem_sisu = %v, esperado true", got)
	}
}

func TestBuildFilterClausesIngressoGratuitoFiltraInGratuito(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Ingresso: []string{"gratuito"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	should := shouldClausesFrom(t, clauses[0])
	if len(should) != 1 {
		t.Fatalf("esperado 1 cláusula should, obtido %d", len(should))
	}
	term, ok := should[0]["term"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó term, obtido %T", should[0]["term"])
	}
	if got := term["curso.in_gratuito"]; got != true {
		t.Errorf("curso.in_gratuito = %v, esperado true", got)
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
	if _, ok := should[0]["term"].(map[string]any)["curso.tp_modalidade_ensino"]; !ok {
		t.Errorf("esperado campo curso.tp_modalidade_ensino, obtido %v", should[0])
	}
	if _, ok := should[1]["match"].(map[string]any)["curso.no_modalidade_ensino"]; !ok {
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

func termsAggField(t *testing.T, aggs map[string]any, group string) string {
	t.Helper()

	agg, ok := aggs[group].(map[string]any)
	if !ok {
		t.Fatalf("agregação %q ausente ou com tipo inesperado: %v", group, aggs[group])
	}
	terms, ok := agg["terms"].(map[string]any)
	if !ok {
		t.Fatalf("agregação %q não é terms (%T)", group, agg["terms"])
	}
	field, _ := terms["field"].(string)
	return field
}

// filtersBuckets devolve o mapa de buckets nomeados de uma agregação "filters".
func filtersBuckets(t *testing.T, aggs map[string]any, group string) map[string]any {
	t.Helper()

	agg, ok := aggs[group].(map[string]any)
	if !ok {
		t.Fatalf("agregação %q ausente ou com tipo inesperado: %v", group, aggs[group])
	}
	filters, ok := agg["filters"].(map[string]any)["filters"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó filters.filters, obtido %v", agg["filters"])
	}
	return filters
}

func termsNodeFrom(t *testing.T, clause map[string]any) map[string]any {
	t.Helper()

	terms, ok := clause["terms"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó terms, obtido %T", clause["terms"])
	}
	return terms
}

func shouldClausesFrom(t *testing.T, clause map[string]any) []map[string]any {
	t.Helper()

	boolNode, ok := clause["bool"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó bool, obtido %T", clause["bool"])
	}
	should, ok := boolNode["should"].([]map[string]any)
	if !ok {
		t.Fatalf("esperado should []map, obtido %T", boolNode["should"])
	}
	return should
}

func TestBuildFilterClausesGrauCombinaValoresComOu(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Grau: []string{"Bacharelado", "Licenciatura"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	should := shouldClausesFrom(t, clauses[0])
	if len(should) != 2 {
		t.Fatalf("esperado 2 cláusulas should, obtido %d", len(should))
	}
	for i, want := range []string{"Bacharelado", "Licenciatura"} {
		match := should[i]["match"].(map[string]any)
		if got := match["curso.no_grau_academico"]; got != want {
			t.Errorf("should[%d] = %v, esperado %q", i, got, want)
		}
	}
}

func TestBuildFilterClausesCategoriaPrivadaComFinsLucrativos(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Categoria: []string{"Privada Com Fins Lucrativos"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	should := shouldClausesFrom(t, clauses[0])
	terms := should[0]["terms"].(map[string]any)["instituicao.categoria_administrativa"]
	want := []string{"Privada Com Fins Lucrativos"}
	if !reflect.DeepEqual(terms, want) {
		t.Errorf("categorias = %v, esperado %v", terms, want)
	}
}

func TestBuildFilterClausesCategoriaPrivadaSemFinsLucrativos(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Categoria: []string{"Privada Sem Fins Lucrativos"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}

	should := shouldClausesFrom(t, clauses[0])
	terms := should[0]["terms"].(map[string]any)["instituicao.categoria_administrativa"]
	want := []string{"Privada Sem Fins Lucrativos"}
	if !reflect.DeepEqual(terms, want) {
		t.Errorf("categorias = %v, esperado %v", terms, want)
	}
}

func TestBuildFilterClausesCategoriaDesconhecidaNaoGeraFiltro(t *testing.T) {
	if clauses := buildFilterClauses(SearchFilterParams{Categoria: []string{"inexistente"}}); len(clauses) != 0 {
		t.Errorf("esperado nenhuma cláusula, obtido %v", clauses)
	}
}

func TestBuildFilterClausesModalidadePresencial(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Modalidade: []string{"Presencial"}})
	should := shouldClausesFrom(t, clauses[0])
	if got := should[0]["term"].(map[string]any)["curso.tp_modalidade_ensino"]; got != "1" {
		t.Errorf("tp_modalidade_ensino = %v, esperado \"1\"", got)
	}
}

func TestBuildFilterClausesTurnoUsaVagasDoCenso(t *testing.T) {
	cases := []struct {
		turno string
		field string
	}{
		{"noturno", "censo_metricas.qt_vg_total_noturno"},
		{"DIURNO", "censo_metricas.qt_vg_total_diurno"},
		{"ead", "censo_metricas.qt_vg_total_ead"},
	}
	for _, c := range cases {
		t.Run(c.turno, func(t *testing.T) {
			clauses := buildFilterClauses(SearchFilterParams{Turno: []string{c.turno}})
			should := shouldClausesFrom(t, clauses[0])
			rng, ok := should[0]["range"].(map[string]any)
			if !ok {
				t.Fatalf("esperado cláusula range, obtido %v", should[0])
			}
			if _, ok := rng[c.field]; !ok {
				t.Errorf("esperado campo %s, obtido %v", c.field, rng)
			}
		})
	}
}

func TestBuildFilterClausesTurnosSeCombinamNumaUnicaClausulaOu(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Turno: []string{"noturno", "ead"}})
	if len(clauses) != 1 {
		t.Fatalf("esperado 1 cláusula, obtido %d", len(clauses))
	}
	if should := shouldClausesFrom(t, clauses[0]); len(should) < 2 {
		t.Errorf("esperado cláusulas de ambos os turnos, obtido %v", should)
	}
}

func TestBuildFilterClausesFiltrosDiferentesSeCombinamComE(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{
		UF: []string{"SP"}, Grau: []string{"Bacharelado"}, Enade: []string{"5"},
	})
	if len(clauses) != 3 {
		t.Errorf("esperado 3 cláusulas (uma por filtro), obtido %d", len(clauses))
	}
}

func TestBuildFilterClausesSemFiltrosNaoGeraClausulas(t *testing.T) {
	if clauses := buildFilterClauses(SearchFilterParams{}); len(clauses) != 0 {
		t.Errorf("esperado nenhuma cláusula, obtido %v", clauses)
	}
}

func TestBuildSortClausesEnadeOrdenaPeloContinuoDecrescente(t *testing.T) {
	clauses := buildSortClauses("enade")
	spec, ok := clauses[0]["enade.conceito_continuo_enade"].(map[string]any)
	if !ok {
		t.Fatalf("esperado ordenação por enade.conceito_continuo_enade, obtido %v", clauses[0])
	}
	if spec["order"] != "desc" || spec["missing"] != "_last" {
		t.Errorf("ordenação = %v, esperado desc com ausentes por último", spec)
	}
}

func TestBuildSortClausesDesistenciaOrdenaPeloMenorTda(t *testing.T) {
	clauses := buildSortClauses("desistencia")
	spec, ok := clauses[0]["tda.tda"].(map[string]any)
	if !ok {
		t.Fatalf("esperado ordenação por tda.tda, obtido %v", clauses[0])
	}
	if spec["order"] != "asc" || spec["missing"] != "_last" {
		t.Errorf("ordenação = %v, esperado asc com ausentes por último", spec)
	}
}

func TestBuildFilterClausesTurnoIntegralUsaNestedNasOfertas(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Turno: []string{"integral"}})
	should := shouldClausesFrom(t, clauses[0])
	if len(should) != 1 {
		t.Fatalf("esperado 1 cláusula should para integral, obtido %d", len(should))
	}

	nested, ok := should[0]["nested"].(map[string]any)
	if !ok {
		t.Fatalf("esperado nó nested, obtido %v", should[0])
	}
	if nested["path"] != "sisu.ofertas" {
		t.Errorf("path = %v, esperado sisu.ofertas", nested["path"])
	}
	terms := nested["query"].(map[string]any)["terms"].(map[string]any)["sisu.ofertas.turno"]
	if !reflect.DeepEqual(terms, []string{"Integral"}) {
		t.Errorf("termos = %v, esperado [Integral]", terms)
	}
}

func TestBuildFilterClausesTurnoDiurnoAgrupaMatutinoEVespertino(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Turno: []string{"diurno"}})
	should := shouldClausesFrom(t, clauses[0])
	if len(should) != 2 {
		t.Fatalf("esperado 2 cláusulas (censo + sisu), obtido %d", len(should))
	}

	nested := should[1]["nested"].(map[string]any)
	terms := nested["query"].(map[string]any)["terms"].(map[string]any)["sisu.ofertas.turno"]
	if !reflect.DeepEqual(terms, []string{"Matutino", "Vespertino"}) {
		t.Errorf("termos = %v, esperado [Matutino Vespertino]", terms)
	}
}

func TestBuildFilterClausesTurnoNoturnoNaoUsaMaiusculas(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Turno: []string{"noturno"}})
	should := shouldClausesFrom(t, clauses[0])

	nested := should[1]["nested"].(map[string]any)
	terms := nested["query"].(map[string]any)["terms"].(map[string]any)["sisu.ofertas.turno"]
	if !reflect.DeepEqual(terms, []string{"Noturno"}) {
		t.Errorf("termos = %v, esperado [Noturno]", terms)
	}
}

func TestBuildFilterClausesGrauNormalizaCaixaDeTitulo(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Grau: []string{"bacharelado"}})
	should := shouldClausesFrom(t, clauses[0])

	match := should[0]["match"].(map[string]any)
	if got := match["curso.no_grau_academico"]; got != "Bacharelado" {
		t.Errorf("grau = %v, esperado Bacharelado", got)
	}
}

func TestBuildFilterClausesModalidadeNormalizaNome(t *testing.T) {
	clauses := buildFilterClauses(SearchFilterParams{Modalidade: []string{"EaD"}})
	should := shouldClausesFrom(t, clauses[0])

	match := should[1]["match"].(map[string]any)
	if got := match["curso.no_modalidade_ensino"]; got != "Distância" {
		t.Errorf("modalidade = %v, esperado Distância", got)
	}
}
