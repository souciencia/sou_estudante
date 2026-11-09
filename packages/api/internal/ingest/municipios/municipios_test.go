package municipios

import (
	"context"
	"io"
	"net/http"
	"reflect"
	"strings"
	"testing"

	"api_estudante/internal/testutil"
)

func TestNewStreamAgregaPorUFEDedupPorCodigo(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.URL.Path == "/cursos-latest/_search":
			_, _ = w.Write([]byte(`{"aggregations":{"municipios":{"buckets":[
				{"key":{"uf":"SP","codigo":"3550308","nome":"São Paulo"}},
				{"key":{"uf":"SP","codigo":"3509502","nome":"Campinas"}},
				{"key":{"uf":"RJ","codigo":"3304557","nome":"Rio de Janeiro"}}
			]}}}`))
		case r.URL.Path == "/ies-latest/_search":
			// Repete São Paulo (mesmo código) e adiciona um município novo.
			_, _ = w.Write([]byte(`{"aggregations":{"municipios":{"buckets":[
				{"key":{"uf":"SP","codigo":"3550308","nome":"São Paulo"}},
				{"key":{"uf":"SP","codigo":"3548708","nome":"São Bernardo do Campo"}}
			]}}}`))
		default:
			t.Errorf("requisição inesperada: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusInternalServerError)
		}
	})

	stream, err := NewStream(context.Background(), client, []string{"cursos-latest", "ies-latest"})
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	var docs []Document
	for {
		doc, err := stream.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatalf("erro ao ler stream: %v", err)
		}
		d, ok := doc.Body.(Document)
		if !ok {
			t.Fatalf("documento inesperado: %#v", doc.Body)
		}
		docs = append(docs, d)
	}

	if len(docs) != 2 {
		t.Fatalf("estados = %d, esperado 2", len(docs))
	}

	if docs[0].UF != "RJ" || docs[1].UF != "SP" {
		t.Errorf("UFs fora de ordem alfabética: %s, %s", docs[0].UF, docs[1].UF)
	}

	var sp Document
	for _, d := range docs {
		if d.UF == "SP" {
			sp = d
		}
	}
	want := []Municipio{
		{Codigo: "3509502", Nome: "Campinas"},
		{Codigo: "3548708", Nome: "São Bernardo do Campo"},
		{Codigo: "3550308", Nome: "São Paulo"},
	}
	if !reflect.DeepEqual(sp.Municipios, want) {
		t.Errorf("municípios de SP = %#v, esperado %#v", sp.Municipios, want)
	}
}

func TestNewStreamPaginaAteEsgotarBuckets(t *testing.T) {
	var bodies []string
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		bodies = append(bodies, string(raw))

		w.Header().Set("Content-Type", "application/json")
		if len(bodies) == 1 {
			_, _ = w.Write([]byte(`{"aggregations":{"municipios":{"after_key":{"uf":"SP","codigo":"3550308","nome":"São Paulo"},"buckets":[{"key":{"uf":"SP","codigo":"3550308","nome":"São Paulo"}}]}}}`))
			return
		}
		_, _ = w.Write([]byte(`{"aggregations":{"municipios":{"buckets":[{"key":{"uf":"RJ","codigo":"3304557","nome":"Rio de Janeiro"}}]}}}`))
	})

	stream, err := NewStream(context.Background(), client, []string{"cursos-latest"})
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	_ = stream

	if len(bodies) != 2 {
		t.Fatalf("buscas = %d, esperado 2 (paginação)", len(bodies))
	}
	if strings.Contains(bodies[0], `"after"`) {
		t.Errorf("primeira busca não deveria ter after: %s", bodies[0])
	}
	if !strings.Contains(bodies[1], `"after"`) {
		t.Errorf("segunda busca deveria repetir o after_key: %s", bodies[1])
	}
}

func TestNewStreamDescartaMunicipioSemCodigoOuNome(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"aggregations":{"municipios":{"buckets":[
			{"key":{"uf":"SP","codigo":"3550308","nome":"São Paulo"}},
			{"key":{"uf":"SP","codigo":"","nome":"Sem código"}},
			{"key":{"uf":"SP","codigo":"3509502","nome":""}}
		]}}}`))
	})

	stream, err := NewStream(context.Background(), client, []string{"cursos-latest"})
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	doc, err := stream.Next()
	if err != nil {
		t.Fatalf("erro ao ler stream: %v", err)
	}
	d := doc.Body.(Document)
	if len(d.Municipios) != 1 || d.Municipios[0].Codigo != "3550308" {
		t.Errorf("municípios = %#v, esperado apenas São Paulo", d.Municipios)
	}
}
