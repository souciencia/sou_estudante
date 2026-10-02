package config

import "testing"

// envVars lista todas as variáveis lidas por Load, para isolar os testes do
// ambiente real.
var envVars = []string{
	"ES_URL",
	"ES_APIKEY",
	"PORT",
	"ES_INDEX_NAME",
	"IES_INDEX_NAME",
	"ES_DICT_INDEX_NAME",
	"IES_DICT_INDEX_NAME",
	"JSON_FILE_PATH",
	"IES_JSON_FILE_PATH",
	"ES_INGEST_APIKEY",
	"ES_NUM_WORKERS",
	"ES_FLUSH_BYTES",
	"ES_FLUSH_INTERVAL_SEC",
}

func clearEnv(t *testing.T) {
	t.Helper()
	for _, key := range envVars {
		t.Setenv(key, "")
	}
}

func TestLoadAppliesDefaultsWhenEnvIsEmpty(t *testing.T) {
	clearEnv(t)

	cfg := Load()

	checks := map[string]any{
		"ESURL":            "http://localhost:9200",
		"ESAPIKey":         "",
		"Port":             "8080",
		"CursosIndexName":  "cursos",
		"IESIndexName":     "ies",
		"DictIndexName":    "dicionario_cursos",
		"IESDictIndexName": "dicionario_ies",
		"JSONFilePath":     "/data/dados_curso_completo.json",
		"IESJSONFilePath":  "/data/dados_ies.json",
		"ESIngestAPIKey":   "",
		"NumWorkers":       4,
		"FlushBytes":       5_000_000,
		"FlushIntervalSec": 30,
	}

	assertConfig(t, cfg, checks)
}

func TestLoadReadsValuesFromEnv(t *testing.T) {
	clearEnv(t)

	values := map[string]string{
		"ES_URL":                "http://outro:9200",
		"ES_APIKEY":             "chave-leitura",
		"PORT":                  "9090",
		"ES_INDEX_NAME":         "cursos_teste",
		"IES_INDEX_NAME":        "ies_teste",
		"ES_DICT_INDEX_NAME":    "dict_cursos_teste",
		"IES_DICT_INDEX_NAME":   "dict_ies_teste",
		"JSON_FILE_PATH":        "/tmp/cursos.json",
		"IES_JSON_FILE_PATH":    "/tmp/ies.json",
		"ES_INGEST_APIKEY":      "chave-escrita",
		"ES_NUM_WORKERS":        "8",
		"ES_FLUSH_BYTES":        "12345",
		"ES_FLUSH_INTERVAL_SEC": "60",
	}
	for key, value := range values {
		t.Setenv(key, value)
	}

	cfg := Load()

	assertConfig(t, cfg, map[string]any{
		"ESURL":            "http://outro:9200",
		"ESAPIKey":         "chave-leitura",
		"Port":             "9090",
		"CursosIndexName":  "cursos_teste",
		"IESIndexName":     "ies_teste",
		"DictIndexName":    "dict_cursos_teste",
		"IESDictIndexName": "dict_ies_teste",
		"JSONFilePath":     "/tmp/cursos.json",
		"IESJSONFilePath":  "/tmp/ies.json",
		"ESIngestAPIKey":   "chave-escrita",
		"NumWorkers":       8,
		"FlushBytes":       12345,
		"FlushIntervalSec": 60,
	})
}

func TestLoadUsaChavesDeAPIDistintas(t *testing.T) {
	clearEnv(t)
	t.Setenv("ES_APIKEY", "somente-leitura")
	t.Setenv("ES_INGEST_APIKEY", "leitura-escrita")

	cfg := Load()

	if cfg.ESAPIKey != "somente-leitura" || cfg.ESIngestAPIKey != "leitura-escrita" {
		t.Fatalf("chaves de API misturadas: leitura=%q ingest=%q", cfg.ESAPIKey, cfg.ESIngestAPIKey)
	}
}

func TestGetEnvIntFallsBack(t *testing.T) {
	casos := []struct {
		key   string
		value string
		want  int
	}{
		{"ES_NUM_WORKERS", "", defaultNumWorkers},
		{"ES_NUM_WORKERS", "invalido", defaultNumWorkers},
		{"ES_NUM_WORKERS", "8", 8},
		{"ES_FLUSH_BYTES", "", defaultFlushBytes},
		{"ES_FLUSH_BYTES", "abc", defaultFlushBytes},
		{"ES_FLUSH_BYTES", "2048", 2048},
		{"ES_FLUSH_INTERVAL_SEC", "", defaultFlushIntervalSec},
		{"ES_FLUSH_INTERVAL_SEC", "x", defaultFlushIntervalSec},
		{"ES_FLUSH_INTERVAL_SEC", "15", 15},
	}

	for _, caso := range casos {
		t.Run(caso.key+"="+caso.value, func(t *testing.T) {
			t.Setenv(caso.key, caso.value)

			var got int
			switch caso.key {
			case "ES_NUM_WORKERS":
				got = Load().NumWorkers
			case "ES_FLUSH_BYTES":
				got = Load().FlushBytes
			case "ES_FLUSH_INTERVAL_SEC":
				got = Load().FlushIntervalSec
			}
			if got != caso.want {
				t.Errorf("%s=%q => %d, esperado %d", caso.key, caso.value, got, caso.want)
			}
		})
	}
}

func assertConfig(t *testing.T, cfg *Config, checks map[string]any) {
	t.Helper()

	actual := map[string]any{
		"ESURL":            cfg.ESURL,
		"ESAPIKey":         cfg.ESAPIKey,
		"Port":             cfg.Port,
		"CursosIndexName":  cfg.CursosIndexName,
		"IESIndexName":     cfg.IESIndexName,
		"DictIndexName":    cfg.DictIndexName,
		"IESDictIndexName": cfg.IESDictIndexName,
		"JSONFilePath":     cfg.JSONFilePath,
		"IESJSONFilePath":  cfg.IESJSONFilePath,
		"ESIngestAPIKey":   cfg.ESIngestAPIKey,
		"NumWorkers":       cfg.NumWorkers,
		"FlushBytes":       cfg.FlushBytes,
		"FlushIntervalSec": cfg.FlushIntervalSec,
	}

	for field, want := range checks {
		if got := actual[field]; got != want {
			t.Errorf("%s = %v, esperado %v", field, got, want)
		}
	}
}
