package ingest

import (
	"path/filepath"
	"testing"

	"api_estudante/internal/testutil"
)

func TestDocumentsIndexaPorCoIESEIgnoraVazios(t *testing.T) {
	content := `[
		{"ies_co_ies":376,"ies_no_ies":"CENTRO UNIVERSITÁRIO ANHANGUERA DE SÃO PAULO"},
		{"ies_co_ies":383,"ies_no_ies":"UNIVERSIDADE DA AMAZÔNIA"},
		{"ies_no_ies":"SEM CO_IES"}
	]`
	docs, err := Documents(testutil.WriteTempFile(t, "ies.json", content))
	if err != nil {
		t.Fatalf("carregar documentos: %v", err)
	}
	if len(docs) != 2 {
		t.Fatalf("esperado 2 documentos, obtido %d (%v)", len(docs), docs)
	}
	if docs["376"].NoIES != "Centro Universitário Anhanguera de São Paulo" || docs["383"].NoIES != "Universidade da Amazônia" {
		t.Errorf("documentos mapeados incorretamente: %+v", docs)
	}
}

func TestDocumentsRetornaErroParaArquivoInexistente(t *testing.T) {
	if _, err := Documents(filepath.Join(t.TempDir(), "inexistente.json")); err == nil {
		t.Fatal("esperado erro ao abrir arquivo inexistente")
	}
}
