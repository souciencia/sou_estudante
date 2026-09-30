package config

import (
	"os"
	"strconv"
)

const (
	defaultESURL            = "http://localhost:9200"
	defaultPort             = "8080"
	defaultCursosIndexName  = "cursos"
	defaultIESIndexName     = "ies"
	defaultDictIndexName    = "dicionario_cursos"
	defaultIESDictIndexName = "dicionario_ies"
	defaultJSONFilePath     = "/data/dados_curso_completo.json"
	defaultIESJSONFilePath  = "/data/dados_ies.json"
	defaultNumWorkers       = 4
	defaultFlushBytes       = 5_000_000
	defaultFlushIntervalSec = 30
)

// Config agrupa os parâmetros dos binários do pacote: a API (somente leitura)
// e o job de ingestão (escrita). Cada binário consome apenas os campos que lhe
// cabem — a API usa ESURL/ESAPIKey/índices; o job usa ESIngestAPIKey e os
// parâmetros de ingestão.
type Config struct {
	ESURL    string
	ESAPIKey string // chave somente leitura usada pela API
	Port     string

	CursosIndexName  string
	IESIndexName     string
	DictIndexName    string
	IESDictIndexName string
	JSONFilePath     string
	IESJSONFilePath  string

	ESIngestAPIKey   string // chave de leitura/escrita usada pelo job de ingestão
	NumWorkers       int
	FlushBytes       int
	FlushIntervalSec int
}

func Load() *Config {
	return &Config{
		ESURL:            getEnv("ES_URL", defaultESURL),
		ESAPIKey:         os.Getenv("ES_APIKEY"),
		Port:             getEnv("PORT", defaultPort),
		CursosIndexName:  getEnv("ES_INDEX_NAME", defaultCursosIndexName),
		IESIndexName:     getEnv("IES_INDEX_NAME", defaultIESIndexName),
		DictIndexName:    getEnv("ES_DICT_INDEX_NAME", defaultDictIndexName),
		IESDictIndexName: getEnv("IES_DICT_INDEX_NAME", defaultIESDictIndexName),
		JSONFilePath:     getEnv("JSON_FILE_PATH", defaultJSONFilePath),
		IESJSONFilePath:  getEnv("IES_JSON_FILE_PATH", defaultIESJSONFilePath),
		ESIngestAPIKey:   os.Getenv("ES_INGEST_APIKEY"),
		NumWorkers:       getEnvInt("ES_NUM_WORKERS", defaultNumWorkers),
		FlushBytes:       getEnvInt("ES_FLUSH_BYTES", defaultFlushBytes),
		FlushIntervalSec: getEnvInt("ES_FLUSH_INTERVAL_SEC", defaultFlushIntervalSec),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}
