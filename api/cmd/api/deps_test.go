package main

import (
	"os/exec"
	"strings"
	"testing"
)

// A API é somente leitura: não pode depender do lado de escrita (ingestão).
// Ver api/AGENTS.md.
const (
	ingestRoot      = "api_estudante/internal/ingest"
	featuresRoot    = "api_estudante/internal/features/"
	featureIngestSg = "ingest"
)

// isIngestPackage informa se o pacote pertence ao lado de escrita:
// internal/ingest/... ou internal/features/<feature>/ingest/...
func isIngestPackage(importPath string) bool {
	if importPath == ingestRoot || strings.HasPrefix(importPath, ingestRoot+"/") {
		return true
	}
	rest, ok := strings.CutPrefix(importPath, featuresRoot)
	if !ok {
		return false
	}
	parts := strings.Split(rest, "/")
	return len(parts) >= 2 && parts[1] == featureIngestSg
}

func TestIsIngestPackage(t *testing.T) {
	cases := []struct {
		path string
		want bool
	}{
		{"api_estudante/internal/ingest", true},
		{"api_estudante/internal/ingest/bulk", true},
		{"api_estudante/internal/ingest/seed", true},
		{"api_estudante/internal/features/cursos/ingest", true},
		{"api_estudante/internal/features/ies/ingest/loader", true},
		{"api_estudante/internal/features/cursos", false},
		{"api_estudante/internal/features/sugestoes", false},
		{"api_estudante/internal/ingestao", false},
		{"api_estudante/internal/elasticsearch", false},
		{"net/http", false},
	}
	for _, c := range cases {
		if got := isIngestPackage(c.path); got != c.want {
			t.Errorf("isIngestPackage(%q) = %v, esperado %v", c.path, got, c.want)
		}
	}
}

func TestAPINaoDependeDaIngestao(t *testing.T) {
	out, err := exec.Command("go", "list", "-deps", "-f", "{{.ImportPath}}", ".").Output()
	if err != nil {
		t.Fatalf("go list -deps falhou: %v", err)
	}

	var proibidos []string
	for _, path := range strings.Fields(string(out)) {
		if isIngestPackage(path) {
			proibidos = append(proibidos, path)
		}
	}
	if len(proibidos) > 0 {
		t.Errorf("cmd/api não pode depender da ingestão, mas importa (direta ou indiretamente):\n  %s",
			strings.Join(proibidos, "\n  "))
	}
}
