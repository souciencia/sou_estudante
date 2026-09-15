package main

import (
	"time"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"
)

func NewElasticsearchClient(cfg *Config) (*elasticsearch.Client, error) {
	esCfg := elasticsearch.Config{
		Addresses: []string{cfg.ElasticsearchURL},
		APIKey:    cfg.ElasticsearchAPIKey,
	}

	return elasticsearch.NewClient(esCfg)
}

func NewBulkIndexer(client *elasticsearch.Client, cfg *Config) (esutil.BulkIndexer, error) {
	return esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Index:         cfg.IndexName,
		Client:        client,
		NumWorkers:    cfg.NumWorkers,
		FlushBytes:    cfg.FlushBytes,
		FlushInterval: time.Duration(cfg.FlushIntervalSec) * time.Second,
	})
}
