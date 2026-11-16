package ingest

import (
	"errors"
	"io"
	"path/filepath"
	"testing"

	"api_estudante/internal/testutil"
)

func TestNewStreamRetornaErroParaArquivoInexistente(t *testing.T) {
	if _, err := NewStream(filepath.Join(t.TempDir(), "inexistente.json")); err == nil {
		t.Fatal("esperado erro ao abrir arquivo inexistente")
	}
}

func TestStreamNextUsaCoIESComoID(t *testing.T) {
	content := `[{"ies_co_ies":376,"ies_no_ies":"CENTRO UNIVERSITÁRIO ANHANGUERA DE SÃO PAULO","ies_sg_uf":"SP"}]`
	stream, err := NewStream(testutil.WriteTempFile(t, "ies.json", content))
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
