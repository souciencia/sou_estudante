package ies

import (
	"encoding/json"
	"testing"
)

// TestMappingIsEmbeddedAndStrict garante que o mapping.json foi realmente
// embutido no binário e cobre todos os campos do documento.
func TestMappingIsEmbeddedAndStrict(t *testing.T) {
	var mapping struct {
		Mappings struct {
			Dynamic    string                     `json:"dynamic"`
			Properties map[string]json.RawMessage `json:"properties"`
		} `json:"mappings"`
	}

	if err := json.Unmarshal(Mapping, &mapping); err != nil {
		t.Fatalf("mapping deve ser JSON válido: %v", err)
	}
	if mapping.Mappings.Dynamic != "strict" {
		t.Errorf("dynamic = %q, esperado %q", mapping.Mappings.Dynamic, "strict")
	}

	for _, field := range []string{"co_ies", "no_ies", "sg_ies", "categoria_administrativa", "organizacao_academica", "municipio", "uf", "regiao"} {
		if _, ok := mapping.Mappings.Properties[field]; !ok {
			t.Errorf("mapping não declara o campo %q", field)
		}
	}
}
