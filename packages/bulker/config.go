package main

import "os"

type Config struct {
	ElasticsearchURL    string
	ElasticsearchAPIKey string
	IndexName           string
	JSONFilePath        string
	NumWorkers          int
	FlushBytes          int
	FlushIntervalSec    int
}

func LoadConfig() *Config {
	return &Config{
		ElasticsearchURL:    getEnv("ELASTICSEARCH_URL", "http://se_es01:9200"),
		ElasticsearchAPIKey: getEnv("ELASTICSEARCH_APIKEY", ""),
		IndexName:           getEnv("ES_INDEX_NAME", "cursos"),
		JSONFilePath:        getEnv("JSON_FILE_PATH", "/data/dados_curso_completo.json"),
		NumWorkers:          4,
		FlushBytes:          5000000, // 5MB
		FlushIntervalSec:    30,
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
