package ingest

import (
	"errors"
	"io"
	"path/filepath"
	"testing"
)

func TestNewStreamRetornaErroParaArquivoInexistente(t *testing.T) {
	if _, err := NewStream(filepath.Join(t.TempDir(), "inexistente.ndjson")); err == nil {
		t.Fatal("esperado erro ao abrir arquivo inexistente")
	}
}

func TestStreamNextUsaCoIESComoID(t *testing.T) {
	content := `{"index": {"_index": "ies", "_id": "376"}}
{"co_ies": "376", "no_ies": "ANHANGUERA", "uf": "SP"}
`
	stream, err := NewStream(writeSourceFile(t, content))
	if err != nil {
		t.Fatalf("abrir stream: %v", err)
	}
	defer stream.Close()

	doc, err := stream.Next()
	if err != nil {
		t.Fatalf("ler documento: %v", err)
	}
	if doc.ID != "376" {
		t.Errorf("ID = %q, esperado 376", doc.ID)
	}

	if _, err := stream.Next(); !errors.Is(err, io.EOF) {
		t.Fatalf("esperado EOF, obtido %v", err)
	}
}
