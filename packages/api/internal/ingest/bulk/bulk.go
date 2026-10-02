package bulk

import (
	"time"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"

	"api_estudante/internal/config"
)

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
