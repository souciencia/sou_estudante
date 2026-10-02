package elasticsearch

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"testing"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/testutil"
)

type testDoc struct {
	CoIES string `json:"co_ies"`
	NoIES string `json:"no_ies"`
}

// roundTripFunc permite forçar erros de transporte sem depender de rede.
type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestParseBucketsFormatoArray(t *testing.T) {
	raw := map[string]json.RawMessage{
		"ufs": json.RawMessage(`{"buckets":[{"key":"SP","doc_count":7},{"key":"RJ","doc_count":3}]}`),
	}

	buckets := ParseBuckets(raw, "ufs")
	if len(buckets) != 2 {
		t.Fatalf("esperado 2 buckets, obtido %d", len(buckets))
	}
	if buckets[0].Key != "SP" || buckets[0].Count != 7 {
		t.Errorf("primeiro bucket = %+v, esperado SP/7", buckets[0])
	}
}

func TestParseBucketsFormatoMapa(t *testing.T) {
	raw := map[string]json.RawMessage{
		"categorias": json.RawMessage(`{"buckets":{"Privada":{"doc_count":5},"Federal":{"doc_count":2}}}`),
	}

	buckets := ParseBuckets(raw, "categorias")
	if len(buckets) != 2 {
		t.Fatalf("esperado 2 buckets, obtido %d", len(buckets))
	}
	byKey := map[string]int{}
	for _, bucket := range buckets {
		byKey[bucket.Key] = bucket.Count
	}
	if byKey["Privada"] != 5 || byKey["Federal"] != 2 {
		t.Errorf("buckets inesperados: %v", byKey)
	}
}

func TestParseBucketsConverteChaveNumerica(t *testing.T) {
	raw := map[string]json.RawMessage{
		"anos": json.RawMessage(`{"buckets":[{"key":2024,"doc_count":1}]}`),
	}

	buckets := ParseBuckets(raw, "anos")
	if len(buckets) != 1 || buckets[0].Key != "2024" {
		t.Errorf("chave numérica não convertida: %+v", buckets)
	}
}

func TestParseBucketsAusenteOuVazio(t *testing.T) {
	if got := ParseBuckets(map[string]json.RawMessage{}, "ufs"); got != nil {
		t.Errorf("ausente deveria ser nil, obtido %v", got)
	}
	raw := map[string]json.RawMessage{
		"ufs":      json.RawMessage(`{"buckets":[]}`),
		"vazio":    json.RawMessage(`{}`),
		"nulo":     json.RawMessage(`{"buckets":null}`),
		"quebrado": json.RawMessage(`{nao-e-json`),
	}
	for _, name := range []string{"ufs", "vazio", "nulo", "quebrado"} {
		if got := ParseBuckets(raw, name); got != nil {
			t.Errorf("ParseBuckets(%q) deveria ser nil, obtido %v", name, got)
		}
	}
}

func TestExecuteSearchDecodificaHitsEAgregacoes(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{
			"hits": {
				"total": {"value": 2},
				"hits": [
					{"_source": {"co_ies": "1", "no_ies": "A"}},
					{"_source": {"co_ies": "2", "no_ies": "B"}}
				]
			},
			"aggregations": {"ufs": {"buckets": [{"key": "SP", "doc_count": 2}]}}
		}`))
	})

	query := map[string]interface{}{"query": map[string]interface{}{"match_all": map[string]interface{}{}}}
	resp, err := ExecuteSearch[testDoc](context.Background(), client, "ies", query)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if resp.Total != 2 {
		t.Errorf("total = %d, esperado 2", resp.Total)
	}
	if len(resp.Hits) != 2 || resp.Hits[1].NoIES != "B" {
		t.Errorf("hits decodificados incorretamente: %+v", resp.Hits)
	}
	if _, ok := resp.Aggregations["ufs"]; !ok {
		t.Errorf("agregação 'ufs' ausente: %v", resp.Aggregations)
	}
}

func TestExecuteSearchRetornaErroEmStatusDeErro(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error": "boom"}`))
	})

	_, err := ExecuteSearch[testDoc](context.Background(), client, "ies", map[string]interface{}{})
	if err == nil || !strings.Contains(err.Error(), "erro ES [500") {
		t.Fatalf("esperado erro ES [500, obtido %v", err)
	}
}

func TestExecuteSearchRetornaErroDeSerializacao(t *testing.T) {
	client := testutil.NewESClient(t, func(http.ResponseWriter, *http.Request) {})

	query := map[string]interface{}{"invalido": make(chan int)}
	_, err := ExecuteSearch[testDoc](context.Background(), client, "ies", query)
	if err == nil || !strings.Contains(err.Error(), "erro ao montar query") {
		t.Fatalf("esperado erro ao montar query, obtido %v", err)
	}
}

func TestExecuteSearchRetornaErroDeTransporte(t *testing.T) {
	client, err := es.NewClient(es.Config{
		Addresses: []string{"http://localhost:9200"},
		Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
			return nil, errors.New("conexão recusada")
		}),
	})
	if err != nil {
		t.Fatalf("criar cliente: %v", err)
	}

	_, err = ExecuteSearch[testDoc](context.Background(), client, "ies", map[string]interface{}{})
	if err == nil || !strings.Contains(err.Error(), "erro ao executar search") {
		t.Fatalf("esperado erro ao executar search, obtido %v", err)
	}
}

func TestExecuteSearchRetornaErroDeDecodificacao(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{nao-e-json`))
	})

	_, err := ExecuteSearch[testDoc](context.Background(), client, "ies", map[string]interface{}{})
	if err == nil || !strings.Contains(err.Error(), "erro ao decodificar resposta") {
		t.Fatalf("esperado erro ao decodificar resposta, obtido %v", err)
	}
}

func TestGetByIDDecodificaSource(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"_index":"ies","_id":"376","found":true,"_source":{"co_ies":"376","no_ies":"ANHANGUERA"}}`))
	})

	doc, err := GetByID[testDoc](context.Background(), client, "ies", "376", "ies", errors.New("nao encontrado"))
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if doc.CoIES != "376" || doc.NoIES != "ANHANGUERA" {
		t.Errorf("documento decodificado incorretamente: %+v", doc)
	}
}

func TestGetByIDRetornaNotFoundSentinel(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte(`{"found":false}`))
	})

	notFound := errors.New("ies não encontrada")
	_, err := GetByID[testDoc](context.Background(), client, "ies", "999", "ies", notFound)
	if !errors.Is(err, notFound) {
		t.Fatalf("esperado sentinel de not found, obtido %v", err)
	}
}

func TestGetByIDRetornaErroEmStatusDeErro(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(`{"error": "boom"}`))
	})

	notFound := errors.New("ies não encontrada")
	_, err := GetByID[testDoc](context.Background(), client, "ies", "376", "ies", notFound)
	if err == nil || errors.Is(err, notFound) || !strings.Contains(err.Error(), "erro ES [500") {
		t.Fatalf("esperado erro ES [500 distinto do sentinel, obtido %v", err)
	}
}

func TestGetByIDRetornaErroDeDecodificacao(t *testing.T) {
	client := testutil.NewESClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{nao-e-json`))
	})

	_, err := GetByID[testDoc](context.Background(), client, "ies", "376", "ies", errors.New("nao encontrado"))
	if err == nil || !strings.Contains(err.Error(), "erro ao decodificar ies") {
		t.Fatalf("esperado erro ao decodificar, obtido %v", err)
	}
}

func TestNewClientRejeitaEnderecoInvalido(t *testing.T) {
	if _, err := NewClient("://invalido", "chave"); err == nil {
		t.Fatal("esperado erro para endereço inválido")
	}
}

func TestNewClientCriaClienteSemContatoComServidor(t *testing.T) {
	client, err := NewClient("http://localhost:9200", "chave")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if client == nil {
		t.Fatal("cliente não deveria ser nil")
	}
}
