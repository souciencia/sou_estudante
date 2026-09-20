package source

import (
	"os"
	"path/filepath"
	"testing"
)

func writeSourceFile(t *testing.T, content string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "origem.json")
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatalf("preparar arquivo de teste: %v", err)
	}
	return path
}

func TestReaderReturnsEveryRecordInOrder(t *testing.T) {
	path := writeSourceFile(t, `[{"sequencial":1,"curso_no_curso":"DIREITO"},{"sequencial":2,"curso_no_curso":"MEDICINA"}]`)

	reader, err := Open(path)
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	first, err := reader.Next()
	if err != nil {
		t.Fatalf("ler primeiro registro: %v", err)
	}
	if first.CursoNoCurso != "DIREITO" {
		t.Errorf("primeiro curso = %q, esperado %q", first.CursoNoCurso, "DIREITO")
	}

	second, err := reader.Next()
	if err != nil {
		t.Fatalf("ler segundo registro: %v", err)
	}
	if second.CursoNoCurso != "MEDICINA" {
		t.Errorf("segundo curso = %q, esperado %q", second.CursoNoCurso, "MEDICINA")
	}

	if _, err := reader.Next(); !IsEOF(err) {
		t.Fatalf("esperado EOF após o último registro, obtido %v", err)
	}
}

func TestReaderReturnsEOFForEmptyArray(t *testing.T) {
	reader, err := Open(writeSourceFile(t, `[]`))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	if _, err := reader.Next(); !IsEOF(err) {
		t.Fatalf("esperado EOF para array vazio, obtido %v", err)
	}
}
