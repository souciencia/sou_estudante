package config

import (
	"os"
	"strconv"
)

const (
	defaultElasticsearchURL = "http://se_es01:9200"
	defaultIndexName        = "cursos"
	defaultDictIndexName    = "dicionario_cursos"
	defaultJSONFilePath     = "/data/dados_curso_completo.json"
	defaultNumWorkers       = 4
	defaultFlushBytes       = 5_000_000
	defaultFlushIntervalSec = 30
)

// Config agrupa os parâmetros de execução do bulking.
type Config struct {
	ElasticsearchURL    string
	ElasticsearchAPIKey string
	IndexName           string
	DictIndexName       string
	JSONFilePath        string
	NumWorkers          int
	FlushBytes          int
	FlushIntervalSec    int
}

// Load lê a configuração do ambiente, aplicando os padrões do serviço.
func Load() *Config {
	return &Config{
		ElasticsearchURL:    env("ELASTICSEARCH_URL", defaultElasticsearchURL),
		ElasticsearchAPIKey: env("ELASTICSEARCH_APIKEY", ""),
		IndexName:           env("ES_INDEX_NAME", defaultIndexName),
		DictIndexName:       env("ES_DICT_INDEX_NAME", defaultDictIndexName),
		JSONFilePath:        env("JSON_FILE_PATH", defaultJSONFilePath),
		NumWorkers:          envInt("ES_NUM_WORKERS", defaultNumWorkers),
		FlushBytes:          envInt("ES_FLUSH_BYTES", defaultFlushBytes),
		FlushIntervalSec:    envInt("ES_FLUSH_INTERVAL_SEC", defaultFlushIntervalSec),
	}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func envInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}
