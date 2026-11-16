// Package testutil reúne helpers compartilhados entre os testes da API.
package testutil

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
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

// DecodeJSONObject decodifica raw (por exemplo, o corpo de uma requisição ao
// Elasticsearch capturada pelo handler de NewESClient) em um objeto JSON
// genérico, falhando o teste se não for JSON válido.
func DecodeJSONObject(t testing.TB, raw string) map[string]any {
	t.Helper()

	var body map[string]any
	if err := json.Unmarshal([]byte(raw), &body); err != nil {
		t.Fatalf("corpo da requisição inválido: %v (%s)", err, raw)
	}
	return body
}

// WriteTempFile grava content em um arquivo chamado name dentro de um diretório
// temporário do teste e devolve o caminho, para exercitar leitores de arquivo.
func WriteTempFile(t testing.TB, name, content string) string {
	t.Helper()

	path := filepath.Join(t.TempDir(), name)
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatalf("preparar arquivo de teste: %v", err)
	}
	return path
}
