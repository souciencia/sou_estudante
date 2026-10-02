package mappings

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"

	"api_estudante/internal/features/cursos"
	"api_estudante/internal/features/ies"
)

func TestCursosMappingIsEmbeddedAndStrict(t *testing.T) {
	var mapping struct {
		Mappings struct {
			Dynamic    string                     `json:"dynamic"`
			Properties map[string]json.RawMessage `json:"properties"`
		} `json:"mappings"`
	}

	if err := json.Unmarshal(Cursos, &mapping); err != nil {
		t.Fatalf("mapping de cursos deve ser JSON válido: %v", err)
	}
	if mapping.Mappings.Dynamic != "strict" {
		t.Errorf("dynamic = %q, esperado %q", mapping.Mappings.Dynamic, "strict")
	}

	for _, field := range []string{"sequencial", "instituicao", "curso", "localizacao", "censo_metricas", "enade", "tda", "sisu"} {
		if _, ok := mapping.Mappings.Properties[field]; !ok {
			t.Errorf("mapping de cursos não declara o campo %q", field)
		}
	}
}

func TestIESMappingIsEmbeddedAndStrict(t *testing.T) {
	var mapping struct {
		Mappings struct {
			Dynamic    string                     `json:"dynamic"`
			Properties map[string]json.RawMessage `json:"properties"`
		} `json:"mappings"`
	}

	if err := json.Unmarshal(IES, &mapping); err != nil {
		t.Fatalf("mapping de IES deve ser JSON válido: %v", err)
	}
	if mapping.Mappings.Dynamic != "strict" {
		t.Errorf("dynamic = %q, esperado %q", mapping.Mappings.Dynamic, "strict")
	}

	for _, field := range []string{"co_ies", "no_ies", "sg_ies", "categoria_administrativa", "organizacao_academica", "municipio", "uf", "regiao"} {
		if _, ok := mapping.Mappings.Properties[field]; !ok {
			t.Errorf("mapping de IES não declara o campo %q", field)
		}
	}
}

func TestDictionaryMappingsUseBrazilianAnalyzer(t *testing.T) {
	cases := []struct {
		name  string
		raw   []byte
		field string
	}{
		{"cursos", CursosDictionary, "no_curso"},
		{"ies", IESDictionary, "no_ies"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var mapping struct {
				Settings struct {
					Analysis struct {
						Analyzer map[string]struct {
							Filter []string `json:"filter"`
						} `json:"analyzer"`
					} `json:"analysis"`
				} `json:"settings"`
				Mappings struct {
					Properties map[string]struct {
						Type     string `json:"type"`
						Analyzer string `json:"analyzer"`
					} `json:"properties"`
				} `json:"mappings"`
			}

			if err := json.Unmarshal(tc.raw, &mapping); err != nil {
				t.Fatalf("mapping de dicionário deve ser JSON válido: %v", err)
			}

			field, ok := mapping.Mappings.Properties[tc.field]
			if !ok {
				t.Fatalf("mapping não declara o campo %q", tc.field)
			}
			if field.Type != "search_as_you_type" {
				t.Errorf("esperado %s type search_as_you_type, recebido %q", tc.field, field.Type)
			}
			if field.Analyzer != "brazilian_search" {
				t.Errorf("esperado %s analyzer brazilian_search, recebido %q", tc.field, field.Analyzer)
			}

			analyzer, ok := mapping.Settings.Analysis.Analyzer["brazilian_search"]
			if !ok {
				t.Fatal("esperado analyzer brazilian_search definido em settings")
			}
			if !hasFilters(analyzer.Filter, "lowercase", "asciifolding") {
				t.Errorf("esperado filtros lowercase e asciifolding, recebido %v", analyzer.Filter)
			}
		})
	}
}

func TestDictionaryMappingsExpoemCampoExato(t *testing.T) {
	cases := []struct {
		name  string
		raw   []byte
		field string
	}{
		{"cursos", CursosDictionary, "no_curso"},
		{"ies", IESDictionary, "no_ies"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var mapping struct {
				Settings struct {
					Analysis struct {
						Normalizer map[string]struct {
							Filter []string `json:"filter"`
						} `json:"normalizer"`
					} `json:"analysis"`
				} `json:"settings"`
				Mappings struct {
					Properties map[string]struct {
						Fields map[string]struct {
							Type       string `json:"type"`
							Normalizer string `json:"normalizer"`
						} `json:"fields"`
					} `json:"properties"`
				} `json:"mappings"`
			}

			if err := json.Unmarshal(tc.raw, &mapping); err != nil {
				t.Fatalf("mapping de dicionário deve ser JSON válido: %v", err)
			}

			field, ok := mapping.Mappings.Properties[tc.field]
			if !ok {
				t.Fatalf("mapping não declara o campo %q", tc.field)
			}
			exato, ok := field.Fields["exato"]
			if !ok {
				t.Fatalf("campo %q não declara subcampo exato", tc.field)
			}
			if exato.Type != "keyword" {
				t.Errorf("tipo de %s.exato = %q, esperado keyword", tc.field, exato.Type)
			}
			if exato.Normalizer != "ascii_lower" {
				t.Errorf("normalizer de %s.exato = %q, esperado ascii_lower", tc.field, exato.Normalizer)
			}

			normalizer, ok := mapping.Settings.Analysis.Normalizer["ascii_lower"]
			if !ok {
				t.Fatal("esperado normalizer ascii_lower definido em settings")
			}
			if !hasFilters(normalizer.Filter, "lowercase", "asciifolding") {
				t.Errorf("esperado filtros lowercase e asciifolding, recebido %v", normalizer.Filter)
			}
		})
	}
}

// Com dynamic: "strict", todo campo emitido pelo documento precisa existir no
// mapping; caso contrário a ingestão falha em runtime. Estes testes comparam as
// tags JSON dos structs de documento com as properties do mapping, incluindo
// objetos aninhados e listas nested.
func TestCursosMappingCobreTodosOsCamposDoDocumento(t *testing.T) {
	assertMappingCoversType(t, topLevelProperties(t, Cursos), reflect.TypeOf(cursos.Curso{}), "Curso")
}

func TestIESMappingCobreTodosOsCamposDoDocumento(t *testing.T) {
	assertMappingCoversType(t, topLevelProperties(t, IES), reflect.TypeOf(ies.IES{}), "IES")
}

// Subcampos "keyword"/"exato" alimentam o dicionário e a busca por nome exato;
// renomeá-los silenciosamente quebraria a busca.
func TestMappingsExpoemSubcamposDeBusca(t *testing.T) {
	casos := []struct {
		nome    string
		props   map[string]json.RawMessage
		caminho []string
	}{
		{"cursos.no_curso", topLevelProperties(t, Cursos), []string{"curso", "no_curso"}},
		{"ies.no_ies", topLevelProperties(t, IES), []string{"no_ies"}},
	}

	for _, caso := range casos {
		t.Run(caso.nome, func(t *testing.T) {
			props := caso.props
			for _, campo := range caso.caminho[:len(caso.caminho)-1] {
				props = nestedProperties(t, props, campo)
			}
			leaf := props[caso.caminho[len(caso.caminho)-1]]

			var node struct {
				Fields map[string]json.RawMessage `json:"fields"`
			}
			if err := json.Unmarshal(leaf, &node); err != nil {
				t.Fatalf("campo %s inválido: %v", caso.nome, err)
			}
			for _, sub := range []string{"keyword", "exato"} {
				if _, ok := node.Fields[sub]; !ok {
					t.Errorf("subcampo fields.%s ausente em %s", sub, caso.nome)
				}
			}

			var exato struct {
				Normalizer string `json:"normalizer"`
			}
			_ = json.Unmarshal(node.Fields["exato"], &exato)
			if exato.Normalizer != "ascii_lower" {
				t.Errorf("normalizer de %s.fields.exato = %q, esperado ascii_lower", caso.nome, exato.Normalizer)
			}
		})
	}
}

func assertMappingCoversType(t *testing.T, props map[string]json.RawMessage, typ reflect.Type, path string) {
	t.Helper()

	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		if field.PkgPath != "" {
			continue
		}
		name := jsonFieldName(field)
		if name == "" || name == "-" {
			continue
		}

		raw, ok := props[name]
		if !ok {
			t.Errorf("mapping não declara o campo %q (em %s)", name, path)
			continue
		}

		elem := field.Type
		for elem.Kind() == reflect.Pointer {
			elem = elem.Elem()
		}
		if elem.Kind() == reflect.Slice {
			elem = elem.Elem()
			for elem.Kind() == reflect.Pointer {
				elem = elem.Elem()
			}
		}
		if elem.Kind() != reflect.Struct {
			continue
		}

		var node struct {
			Properties map[string]json.RawMessage `json:"properties"`
		}
		if err := json.Unmarshal(raw, &node); err != nil || node.Properties == nil {
			t.Errorf("campo %q (em %s) não é objeto com properties", name, path)
			continue
		}
		assertMappingCoversType(t, node.Properties, elem, path+"."+name)
	}
}

func jsonFieldName(field reflect.StructField) string {
	tag := field.Tag.Get("json")
	if tag == "" {
		return field.Name
	}
	return strings.Split(tag, ",")[0]
}

func topLevelProperties(t *testing.T, raw []byte) map[string]json.RawMessage {
	t.Helper()

	var mapping struct {
		Mappings struct {
			Properties map[string]json.RawMessage `json:"properties"`
		} `json:"mappings"`
	}
	if err := json.Unmarshal(raw, &mapping); err != nil {
		t.Fatalf("mapping deve ser JSON válido: %v", err)
	}
	return mapping.Mappings.Properties
}

func nestedProperties(t *testing.T, props map[string]json.RawMessage, field string) map[string]json.RawMessage {
	t.Helper()

	raw, ok := props[field]
	if !ok {
		t.Fatalf("campo %q ausente no mapping", field)
	}
	var node struct {
		Properties map[string]json.RawMessage `json:"properties"`
	}
	if err := json.Unmarshal(raw, &node); err != nil {
		t.Fatalf("campo %q sem properties: %v", field, err)
	}
	return node.Properties
}

func hasFilters(filters []string, wanted ...string) bool {
	set := make(map[string]struct{}, len(filters))
	for _, filter := range filters {
		set[filter] = struct{}{}
	}
	for _, want := range wanted {
		if _, ok := set[want]; !ok {
			return false
		}
	}
	return true
}
