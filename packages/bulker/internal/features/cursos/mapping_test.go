package cursos

import (
	"encoding/json"
	"testing"
)

// TestMappingIsEmbeddedAndStrict garante que o mapping.json foi realmente
// embutido no binário e declara dynamic strict.
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
	if len(mapping.Mappings.Properties) == 0 {
		t.Fatal("mapping embutido não possui properties")
	}
	if mapping.Mappings.Dynamic != "strict" {
		t.Errorf("dynamic = %q, esperado %q", mapping.Mappings.Dynamic, "strict")
	}
}
