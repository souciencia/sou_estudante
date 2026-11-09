package config

import (
	"errors"
	"log/slog"
	"os"
	"strconv"
)

const (
	defaultESURL               = "http://localhost:9200"
	defaultPort                = "8080"
	defaultCursosIndexName     = "cursos"
	defaultIESIndexName        = "ies"
	defaultDictIndexName       = "dicionario-cursos"
	defaultIESDictIndexName    = "dicionario-ies"
	defaultMunicipiosIndexName = "estados-municipios"
	defaultJSONFilePath        = "/data/dados_cursos.json"
	defaultIESJSONFilePath     = "/data/dados_ies.json"
	defaultNumWorkers          = 4
	defaultFlushBytes          = 5_000_000
	defaultFlushIntervalSec    = 30
)

// Config agrupa os parâmetros dos binários do pacote: a API (somente leitura)
// e o job de ingestão (escrita). Cada binário consome apenas os campos que lhe
// cabem — a API usa ESURL/ESAPIKey/índices; o job usa ESIngestAPIKey e os
// parâmetros de ingestão.
type Config struct {
	ESURL    string
	ESAPIKey string // chave somente leitura usada pela API
	Port     string

	CursosIndexName     string
	IESIndexName        string
	DictIndexName       string
	IESDictIndexName    string
	MunicipiosIndexName string
	JSONFilePath        string
	IESJSONFilePath     string

	ESIngestAPIKey   string // chave de leitura/escrita usada pelo job de ingestão
	NumWorkers       int
	FlushBytes       int
	FlushIntervalSec int
}

// ValidateAPI confere o que a API precisa para subir. A chave somente leitura
// é obrigatória: sem ela a API falaria com o Elasticsearch sem autenticação.
func (c *Config) ValidateAPI() error {
	if c.ESAPIKey == "" {
		return errors.New("ES_APIKEY não definida (a API exige a chave somente leitura; rode ./setup.sh)")
	}
	return nil
}

// ValidateSeed confere o que o job de ingestão precisa para rodar.
func (c *Config) ValidateSeed() error {
	if c.ESIngestAPIKey == "" {
		return errors.New("ES_INGEST_APIKEY não definida (o seed exige a chave de leitura/escrita; rode ./setup.sh)")
	}
	return nil
}

// Load lê a configuração do ambiente, aplicando os padrões. Não valida: use
// ValidateAPI ou ValidateSeed conforme o binário.
func Load() *Config {
	return &Config{
		ESURL:               getEnv("ES_URL", defaultESURL),
		ESAPIKey:            os.Getenv("ES_APIKEY"),
		Port:                getEnv("PORT", defaultPort),
		CursosIndexName:     getEnv("CURSOS_INDEX_NAME", defaultCursosIndexName),
		IESIndexName:        getEnv("IES_INDEX_NAME", defaultIESIndexName),
		DictIndexName:       getEnv("CURSOS_DICT_INDEX_NAME", defaultDictIndexName),
		IESDictIndexName:    getEnv("IES_DICT_INDEX_NAME", defaultIESDictIndexName),
		MunicipiosIndexName: getEnv("MUNICIPIOS_INDEX_NAME", defaultMunicipiosIndexName),
		JSONFilePath:        getEnv("CURSOS_JSON_FILE_PATH", defaultJSONFilePath),
		IESJSONFilePath:     getEnv("IES_JSON_FILE_PATH", defaultIESJSONFilePath),
		ESIngestAPIKey:      os.Getenv("ES_INGEST_APIKEY"),
		NumWorkers:          getEnvInt("ES_NUM_WORKERS", defaultNumWorkers),
		FlushBytes:          getEnvInt("ES_FLUSH_BYTES", defaultFlushBytes),
		FlushIntervalSec:    getEnvInt("ES_FLUSH_INTERVAL_SEC", defaultFlushIntervalSec),
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
	if err != nil || parsed <= 0 {
		slog.Warn("valor inválido em variável de ambiente; usando o padrão",
			"variavel", key, "valor", value, "padrao", fallback)
		return fallback
	}
	return parsed
}
