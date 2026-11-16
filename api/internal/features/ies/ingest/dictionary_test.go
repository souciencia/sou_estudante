package ingest

import (
	"io"
	"reflect"
	"testing"

	"api_estudante/internal/features/ies"
)

func TestDictionaryStreamEmiteNomeESiglaOrdenadosPorCoIES(t *testing.T) {
	docs := map[string]ies.IES{
		"1": {CoIES: "1", NoIES: "UNIVERSIDADE DE SÃO PAULO", SgIES: "USP"},
		"2": {CoIES: "2", NoIES: "UNIVERSIDADE FEDERAL DE SÃO PAULO", SgIES: "UNIFESP"},
	}

	stream := NewDictionaryStream(docs)

	var got []DictionaryDocument
	for {
		doc, err := stream.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatalf("erro inesperado: %v", err)
		}
		body, ok := doc.Body.(DictionaryDocument)
		if !ok {
			t.Fatalf("body = %T, esperado DictionaryDocument", doc.Body)
		}
		got = append(got, body)
	}

	want := []DictionaryDocument{
		{NoIES: "UNIVERSIDADE DE SÃO PAULO", SgIES: "USP"},
		{NoIES: "UNIVERSIDADE FEDERAL DE SÃO PAULO", SgIES: "UNIFESP"},
	}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("documentos = %+v, esperado %+v", got, want)
	}
}

func TestDictionaryStreamOmiteSiglaVazia(t *testing.T) {
	docs := map[string]ies.IES{
		"1": {CoIES: "1", NoIES: "SEM SIGLA", SgIES: ""},
	}

	stream := NewDictionaryStream(docs)
	doc, err := stream.Next()
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	body := doc.Body.(DictionaryDocument)
	if body.NoIES != "SEM SIGLA" || body.SgIES != "" {
		t.Errorf("documento = %+v, esperado {SEM SIGLA }", body)
	}
}
