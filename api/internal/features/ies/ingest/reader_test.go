package ingest

import (
	"errors"
	"io"
	"path/filepath"
	"testing"

	"api_estudante/internal/testutil"
)

func TestReaderReturnsEveryRecordInOrder(t *testing.T) {
	path := testutil.WriteTempFile(t, "ies.json", `[{"ies_co_ies":1,"ies_no_ies":"UNIVERSIDADE FEDERAL DE MATO GROSSO"},{"ies_co_ies":2,"ies_no_ies":"UNIVERSIDADE DE BRASÍLIA"}]`)

	reader, err := Open(path)
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	first, err := reader.Next()
	if err != nil {
		t.Fatalf("ler primeiro registro: %v", err)
	}
	if first.IESNoIES != "UNIVERSIDADE FEDERAL DE MATO GROSSO" {
		t.Errorf("primeira IES = %q, esperado %q", first.IESNoIES, "UNIVERSIDADE FEDERAL DE MATO GROSSO")
	}

	second, err := reader.Next()
	if err != nil {
		t.Fatalf("ler segundo registro: %v", err)
	}
	if second.IESNoIES != "UNIVERSIDADE DE BRASÍLIA" {
		t.Errorf("segunda IES = %q, esperado %q", second.IESNoIES, "UNIVERSIDADE DE BRASÍLIA")
	}

	if _, err := reader.Next(); !errors.Is(err, io.EOF) {
		t.Fatalf("esperado EOF após o último registro, obtido %v", err)
	}
}

func TestReaderReturnsEOFForEmptyArray(t *testing.T) {
	reader, err := Open(testutil.WriteTempFile(t, "ies.json", `[]`))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	if _, err := reader.Next(); !errors.Is(err, io.EOF) {
		t.Fatalf("esperado EOF para array vazio, obtido %v", err)
	}
}

func TestReaderRejeitaArquivoNaoArray(t *testing.T) {
	reader, err := Open(testutil.WriteTempFile(t, "ies.json", `{"ies_co_ies":1}`))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	_, err = reader.Next()
	if err == nil || errors.Is(err, io.EOF) {
		t.Fatalf("esperado erro de formato para objeto JSON, obtido %v", err)
	}
}

func TestReaderRetornaErroParaRegistroInvalido(t *testing.T) {
	reader, err := Open(testutil.WriteTempFile(t, "ies.json", `[{"ies_co_ies":"nao-numero"}]`))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	if _, err := reader.Next(); err == nil {
		t.Fatal("esperado erro ao decodificar registro com tipo inválido")
	}
}

func TestOpenRetornaErroParaArquivoInexistente(t *testing.T) {
	if _, err := Open(filepath.Join(t.TempDir(), "inexistente.json")); err == nil {
		t.Fatal("esperado erro ao abrir arquivo inexistente")
	}
}

func TestReaderArquivoTruncadoNoMeioDeRegistro(t *testing.T) {
	reader, err := Open(testutil.WriteTempFile(t, "ies.json", `[{"ies_co_ies":1,"ies_no_ies":"A"},{"ies_co_ies":2,"ies_no_i`))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	if _, err := reader.Next(); err != nil {
		t.Fatalf("primeiro registro deveria ser lido: %v", err)
	}
	for i := 0; i < 3; i++ {
		_, err := reader.Next()
		if err == nil || errors.Is(err, io.EOF) {
			t.Fatalf("chamada %d: esperado erro de truncamento, obtido %v", i, err)
		}
	}
}

func TestReaderArquivoTruncadoAntesDoFechamentoDoArray(t *testing.T) {
	reader, err := Open(testutil.WriteTempFile(t, "ies.json", `[{"ies_co_ies":1,"ies_no_ies":"A"}`))
	if err != nil {
		t.Fatalf("abrir origem: %v", err)
	}
	defer reader.Close()

	if _, err := reader.Next(); err != nil {
		t.Fatalf("primeiro registro deveria ser lido: %v", err)
	}
	// Sem o ']' final o arquivo está truncado: não pode terminar como sucesso.
	if _, err := reader.Next(); err == nil || errors.Is(err, io.EOF) {
		t.Fatalf("esperado erro para array sem fechamento, obtido %v", err)
	}
}
