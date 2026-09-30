package elasticsearch

import es "github.com/elastic/go-elasticsearch/v8"

// NewClient cria um cliente Elasticsearch para a URL e a API key informadas.
// A API usa a chave somente leitura; o job de ingestão usa a de leitura/escrita.
func NewClient(url, apiKey string) (*es.Client, error) {
	return es.NewClient(es.Config{
		Addresses: []string{url},
		APIKey:    apiKey,
	})
}
