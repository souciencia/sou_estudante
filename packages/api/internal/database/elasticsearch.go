package database

import (
	"github.com/elastic/go-elasticsearch/v8"
	"api_estudante/internal/config"
)

func NewElasticsearchClient(cfg *config.Config) (*elasticsearch.Client, error) {
	return elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{cfg.ESURL},
		APIKey: cfg.ESAPIKey,
		// Username:  cfg.ESUsername,
		// Password:  cfg.ESPassword,
	})
}