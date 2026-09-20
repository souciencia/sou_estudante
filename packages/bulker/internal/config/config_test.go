package config

import "testing"

func TestLoadAppliesDefaultsWhenEnvIsEmpty(t *testing.T) {
	t.Setenv("ELASTICSEARCH_URL", "")
	t.Setenv("ES_INDEX_NAME", "")
	t.Setenv("ES_DICT_INDEX_NAME", "")
	t.Setenv("JSON_FILE_PATH", "")

	cfg := Load()

	if cfg.ElasticsearchURL != "http://se_es01:9200" {
		t.Errorf("ElasticsearchURL = %q, esperado o padrão", cfg.ElasticsearchURL)
	}
	if cfg.IndexName != "cursos" {
		t.Errorf("IndexName = %q, esperado %q", cfg.IndexName, "cursos")
	}
	if cfg.DictIndexName != "dicionario_cursos" {
		t.Errorf("DictIndexName = %q, esperado %q", cfg.DictIndexName, "dicionario_cursos")
	}
	if cfg.JSONFilePath != "/data/dados_curso_completo.json" {
		t.Errorf("JSONFilePath = %q, esperado o padrão", cfg.JSONFilePath)
	}
}

func TestLoadReadsValuesFromEnv(t *testing.T) {
	t.Setenv("ELASTICSEARCH_URL", "http://outro:9200")
	t.Setenv("ES_INDEX_NAME", "cursos_teste")
	t.Setenv("ES_NUM_WORKERS", "8")

	cfg := Load()

	if cfg.ElasticsearchURL != "http://outro:9200" {
		t.Errorf("ElasticsearchURL = %q, esperado o valor do ambiente", cfg.ElasticsearchURL)
	}
	if cfg.IndexName != "cursos_teste" {
		t.Errorf("IndexName = %q, esperado o valor do ambiente", cfg.IndexName)
	}
	if cfg.NumWorkers != 8 {
		t.Errorf("NumWorkers = %d, esperado 8", cfg.NumWorkers)
	}
}

func TestLoadFallsBackWhenIntIsInvalid(t *testing.T) {
	t.Setenv("ES_NUM_WORKERS", "invalido")

	if cfg := Load(); cfg.NumWorkers != 4 {
		t.Errorf("NumWorkers = %d, esperado o padrão 4", cfg.NumWorkers)
	}
}
