package municipios

import (
	"context"
	"net/http"
	"reflect"
	"testing"

	"api_estudante/internal/testutil"
)

func TestListarDevolveMunicipiosPorUF(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/estados-municipios/_search" {
			t.Errorf("path = %q, esperado /estados-municipios/_search", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"hits":{"total":{"value":2},"hits":[
			{"_source":{"uf":"SP","municipios":[{"codigo":"3550308","nome":"São Paulo"}]}},
			{"_source":{"uf":"RJ","municipios":[{"codigo":"3304557","nome":"Rio de Janeiro"}]}}
		]}}`))
	})

	repo := NewElasticsearchRepository(client, "estados-municipios")
	got, err := repo.Listar(context.Background())
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	want := Response{
		"SP": {{Codigo: "3550308", Nome: "São Paulo"}},
		"RJ": {{Codigo: "3304557", Nome: "Rio de Janeiro"}},
	}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("resposta = %#v, esperado %#v", got, want)
	}
}

func TestListarRetornaErroEmFalha(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error":"boom"}`))
	})

	repo := NewElasticsearchRepository(client, "estados-municipios")
	if _, err := repo.Listar(context.Background()); err == nil {
		t.Fatal("esperado erro para status 500")
	}
}
