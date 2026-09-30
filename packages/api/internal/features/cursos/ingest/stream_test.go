package ingest

import (
	"errors"
	"io"
	"path/filepath"
	"testing"

	"api_estudante/internal/features/cursos"
)

func TestNewStreamRetornaErroParaArquivoInexistente(t *testing.T) {
	if _, err := NewStream(filepath.Join(t.TempDir(), "inexistente.json"), nil); err == nil {
		t.Fatal("esperado erro ao abrir arquivo inexistente")
	}
}

func TestStreamNextDerivaIDDoSequencialEEnriquece(t *testing.T) {
	path := writeSourceFile(t, `[{"sequencial":10,"ies_co_ies":42,"curso_no_curso":"DIREITO"}]`)
	lookup := map[string]InstituicaoInfo{
		"42": {NoIES: "UNIVERSIDADE DA AMAZÔNIA", OrganizacaoAcademica: "Universidade"},
	}

	stream, err := NewStream(path, lookup)
	if err != nil {
		t.Fatalf("abrir stream: %v", err)
	}
	defer stream.Close()

	doc, err := stream.Next()
	if err != nil {
		t.Fatalf("ler documento: %v", err)
	}
	if doc.ID != "10" {
		t.Errorf("ID = %q, esperado 10", doc.ID)
	}

	curso, ok := doc.Body.(cursos.Curso)
	if !ok {
		t.Fatalf("Body tem tipo %T, esperado cursos.Curso", doc.Body)
	}
	if curso.Curso.NoCurso != "DIREITO" {
		t.Errorf("curso = %q, esperado DIREITO", curso.Curso.NoCurso)
	}
	if curso.Instituicao.NoIES != "UNIVERSIDADE DA AMAZÔNIA" {
		t.Errorf("IES não enriquecida: %+v", curso.Instituicao)
	}

	if _, err := stream.Next(); !errors.Is(err, io.EOF) {
		t.Fatalf("esperado EOF, obtido %v", err)
	}
}

func TestStreamNextSemSequencialDeixaIDVazio(t *testing.T) {
	stream, err := NewStream(writeSourceFile(t, `[{"curso_no_curso":"DIREITO"}]`), nil)
	if err != nil {
		t.Fatalf("abrir stream: %v", err)
	}
	defer stream.Close()

	doc, err := stream.Next()
	if err != nil {
		t.Fatalf("ler documento: %v", err)
	}
	if doc.ID != "" {
		t.Errorf("ID = %q, esperado vazio sem sequencial", doc.ID)
	}
}
