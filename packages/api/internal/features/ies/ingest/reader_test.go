package ingest

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

func TestReaderIgnoraOutrasAcoesDeBulk(t *testing.T) {
	content := `{"create": {"_index": "ies", "_id": "1"}}
{"delete": {"_index": "ies", "_id": "2"}}
{"update": {"_index": "ies", "_id": "3"}}
{"co_ies": "3", "no_ies": "UNAMA", "uf": "PA"}
`
	reader, err := Open(writeSourceFile(t, content))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	record, err := reader.Next()
	if err != nil {
		t.Fatalf("ler registro: %v", err)
	}
	if record.CoIES != "3" {
		t.Errorf("co_ies = %q, esperado 3 (apenas a ação index revela o source)", record.CoIES)
	}

	if _, err := reader.Next(); !errors.Is(err, io.EOF) {
		t.Fatalf("esperado EOF, obtido %v", err)
	}
}

func TestIsMetadataNaoConfundeDocumentoDeOrigem(t *testing.T) {
	casos := []struct {
		nome string
		raw  string
		want bool
	}{
		{"ação index", `{"index":{"_index":"ies"}}`, true},
		{"ação create", `{"create":{"_index":"ies"}}`, true},
		{"ação desconhecida", `{"foo":{"_index":"ies"}}`, false},
		{"documento com chave index e outros campos", `{"co_ies":"1","index":"x"}`, false},
		{"json inválido", `{nao-e-json`, false},
	}

	for _, caso := range casos {
		t.Run(caso.nome, func(t *testing.T) {
			if got := isMetadata([]byte(caso.raw)); got != caso.want {
				t.Errorf("isMetadata(%s) = %v, esperado %v", caso.raw, got, caso.want)
			}
		})
	}
}

func TestOpenRetornaErroParaArquivoInexistente(t *testing.T) {
	if _, err := Open(filepath.Join(t.TempDir(), "inexistente.ndjson")); err == nil {
		t.Fatal("esperado erro ao abrir arquivo inexistente")
	}
}

func TestReaderRetornaErroParaJsonInvalido(t *testing.T) {
	reader, err := Open(writeSourceFile(t, "{nao-e-json"))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	if _, err := reader.Next(); err == nil {
		t.Fatal("esperado erro para JSON inválido")
	}
}
