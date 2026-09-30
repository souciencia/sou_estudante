// Package testutil reúne helpers compartilhados entre os testes da API.
package testutil

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	es "github.com/elastic/go-elasticsearch/v8"
)

// NewESClient cria um cliente do Elasticsearch apontando para um servidor
// httptest que delega as requisições a handler. O header X-Elastic-Product é
// exigido pelo go-elasticsearch v8 para reconhecer as respostas.
func NewESClient(t testing.TB, handler http.HandlerFunc) *es.Client {
	t.Helper()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Elastic-Product", "Elasticsearch")
		handler(w, r)
	}))
	t.Cleanup(server.Close)

	client, err := es.NewClient(es.Config{Addresses: []string{server.URL}})
	if err != nil {
		t.Fatalf("criar cliente de teste: %v", err)
	}
	return client
}

// CountBulkActions conta as linhas de metadata de ação ("index") em um corpo
// bulk NDJSON, sem depender de serialização exata.
func CountBulkActions(body string) int {
	count := 0
	for _, line := range strings.Split(strings.TrimSpace(body), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var meta map[string]json.RawMessage
		if json.Unmarshal([]byte(line), &meta) == nil {
			if _, ok := meta["index"]; ok {
				count++
			}
		}
	}
	return count
}
