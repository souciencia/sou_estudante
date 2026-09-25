package cursos

import (
	"encoding/json"
	"testing"
)

// TestDictionaryMappingUsesBrazilianAnalyzer garante que o campo no_curso do
// dicionário de cursos use o analyzer brazilian_search (lowercase + asciifolding).
func TestDictionaryMappingUsesBrazilianAnalyzer(t *testing.T) {
	var mapping struct {
		Settings struct {
			Analysis struct {
				Analyzer map[string]struct {
					Filter []string `json:"filter"`
				} `json:"analyzer"`
			} `json:"analysis"`
		} `json:"settings"`
		Mappings struct {
			Properties struct {
				NoCurso struct {
					Type     string `json:"type"`
					Analyzer string `json:"analyzer"`
				} `json:"no_curso"`
			} `json:"properties"`
		} `json:"mappings"`
	}

	if err := json.Unmarshal(DictionaryMapping, &mapping); err != nil {
		t.Fatalf("mapping deve ser JSON válido: %v", err)
	}

	field := mapping.Mappings.Properties.NoCurso
	if field.Type != "search_as_you_type" {
		t.Errorf("esperado no_curso type search_as_you_type, recebido %q", field.Type)
	}
	if field.Analyzer != "brazilian_search" {
		t.Errorf("esperado no_curso analyzer brazilian_search, recebido %q", field.Analyzer)
	}

	analyzer, ok := mapping.Settings.Analysis.Analyzer["brazilian_search"]
	if !ok {
		t.Fatal("esperado analyzer brazilian_search definido em settings")
	}
	if !hasFilters(analyzer.Filter, "lowercase", "asciifolding") {
		t.Errorf("esperado filtros lowercase e asciifolding no brazilian_search, recebido %v", analyzer.Filter)
	}
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
