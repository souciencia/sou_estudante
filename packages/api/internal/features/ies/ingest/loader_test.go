package ingest

import (
	"path/filepath"
	"testing"
)

func TestDocumentsIndexaPorCoIESEIgnoraVazios(t *testing.T) {
	content := `{"index": {"_index": "ies", "_id": "376"}}
{"co_ies": "376", "no_ies": "ANHANGUERA"}
{"index": {"_index": "ies", "_id": "383"}}
{"co_ies": "383", "no_ies": "UNAMA"}
{"index": {"_index": "ies"}}
{"no_ies": "SEM CO_IES"}
`
	docs, err := Documents(writeSourceFile(t, content))
	if err != nil {
		t.Fatalf("carregar documentos: %v", err)
	}
	if len(docs) != 2 {
		t.Fatalf("esperado 2 documentos, obtido %d (%v)", len(docs), docs)
	}
	if docs["376"].NoIES != "ANHANGUERA" || docs["383"].NoIES != "UNAMA" {
		t.Errorf("documentos mapeados incorretamente: %+v", docs)
	}
}

func TestDocumentsRetornaErroParaArquivoInexistente(t *testing.T) {
	if _, err := Documents(filepath.Join(t.TempDir(), "inexistente.ndjson")); err == nil {
		t.Fatal("esperado erro ao abrir arquivo inexistente")
	}
}
