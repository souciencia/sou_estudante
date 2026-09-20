package elastic

import (
	"time"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"

	"bulker/internal/config"
)

// NewClient cria um cliente Elasticsearch a partir da configuração.
func NewClient(cfg *config.Config) (*elasticsearch.Client, error) {
	return elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{cfg.ElasticsearchURL},
		APIKey:    cfg.ElasticsearchAPIKey,
	})
}

// NewBulkIndexer cria um BulkIndexer configurado para o índice informado.
func NewBulkIndexer(client *elasticsearch.Client, index string, cfg *config.Config) (esutil.BulkIndexer, error) {
	return esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Index:         index,
		Client:        client,
		NumWorkers:    cfg.NumWorkers,
		FlushBytes:    cfg.FlushBytes,
		FlushInterval: time.Duration(cfg.FlushIntervalSec) * time.Second,
	})
}
