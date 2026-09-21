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

func TestCategoriaTermsCobreCategoriasDaUI(t *testing.T) {
	cases := map[string][]string{
		"privada":   {"Privada com fins lucrativos", "Privada sem fins lucrativos"},
		"federal":   {"Pública Federal"},
		"estadual":  {"Pública Estadual"},
		"municipal": {"Pública Municipal"},
	}

	for in, want := range cases {
		if got := categoriaTerms(in); !reflect.DeepEqual(got, want) {
			t.Errorf("categoriaTerms(%q) = %v, esperado %v", in, got, want)
		}
	}
}
