package main

import "os"

type Config struct {
	ElasticsearchURL      string
	ElasticsearchUsername string
	ElasticsearchPassword string
	ElasticsearchAPIKey   string
	IndexName             string
	DictIndexName         string
	JSONFilePath          string
	EnvFilePath           string
	MappingPath           string
	NumWorkers            int
	FlushBytes            int
	FlushIntervalSec      int
}

func LoadConfig() *Config {
	return &Config{
		ElasticsearchURL:      getEnv("ELASTICSEARCH_URL", "http://se_es01:9200"),
		ElasticsearchUsername: getEnv("ELASTICSEARCH_USERNAME", "elastic"),
		ElasticsearchPassword: getEnv("ELASTIC_PASSWORD", ""),
		ElasticsearchAPIKey:   getEnv("ELASTICSEARCH_APIKEY", ""),
		IndexName:             getEnv("ES_INDEX_NAME", "cursos"),
		DictIndexName:         getEnv("ES_DICT_INDEX_NAME", "dicionario_cursos"),
		JSONFilePath:          getEnv("JSON_FILE_PATH", "/data/dados_curso_completo.json"),
		EnvFilePath:           getEnv("ENV_FILE_PATH", "/app/.env"),
		MappingPath:           getEnv("ES_MAPPING_PATH", "mapping.json"),
		NumWorkers:            4,
		FlushBytes:            5000000, // 5MB
		FlushIntervalSec:      30,
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
