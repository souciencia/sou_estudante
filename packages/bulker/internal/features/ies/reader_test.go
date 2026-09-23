package ies

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"testing"
)

func writeSourceFile(t *testing.T, content string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "ies.ndjson")
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatalf("preparar arquivo de teste: %v", err)
	}
	return path
}

func TestReaderSkipsBulkMetadataAndReturnsSources(t *testing.T) {
	content := `{"index": {"_index": "ies", "_id": "376"}}
{"co_ies": "376", "no_ies": "ANHANGUERA", "uf": "SP"}
{"index": {"_index": "ies", "_id": "383"}}
{"co_ies": "383", "no_ies": "UNAMA", "uf": "PA"}
`
	reader, err := Open(writeSourceFile(t, content))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	first, err := reader.Next()
	if err != nil {
		t.Fatalf("ler primeiro registro: %v", err)
	}
	if first.CoIES != "376" {
		t.Errorf("primeiro co_ies = %q, esperado %q", first.CoIES, "376")
	}

	second, err := reader.Next()
	if err != nil {
		t.Fatalf("ler segundo registro: %v", err)
	}
	if second.CoIES != "383" {
		t.Errorf("segundo co_ies = %q, esperado %q", second.CoIES, "383")
	}

	if _, err := reader.Next(); !errors.Is(err, io.EOF) {
		t.Fatalf("esperado EOF após o último registro, obtido %v", err)
	}
}

func TestReaderReturnsEOFForEmptyFile(t *testing.T) {
	reader, err := Open(writeSourceFile(t, ""))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	if _, err := reader.Next(); !errors.Is(err, io.EOF) {
		t.Fatalf("esperado EOF para arquivo vazio, obtido %v", err)
	}
}
