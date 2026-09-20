package bulker

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/elastic/go-elasticsearch/v8"

	"bulker/internal/config"
	"bulker/internal/dictionary"
	"bulker/internal/elastic"
	"bulker/internal/ingest"
)

// Run executa o bulking de forma idempotente: garante os índices e seus dados
// e encerra. Se os dados já existirem, nada é reindexado.
func Run(ctx context.Context, cfg *config.Config) error {
	if cfg.ElasticsearchAPIKey == "" {
		return fmt.Errorf("ELASTICSEARCH_APIKEY não definida")
	}
	if _, err := os.Stat(cfg.JSONFilePath); err != nil {
		return fmt.Errorf("arquivo de origem indisponível %s: %w", cfg.JSONFilePath, err)
	}

	client, err := elastic.NewClient(cfg)
	if err != nil {
		return fmt.Errorf("criar cliente elasticsearch: %w", err)
	}

	if err := ensureCursos(ctx, client, cfg); err != nil {
		return err
	}
	return ensureDicionario(ctx, client, cfg)
}

func ensureCursos(ctx context.Context, client *elasticsearch.Client, cfg *config.Config) error {
	exists, count, err := indexState(ctx, client, cfg.IndexName)
	if err != nil {
		return err
	}
	if !needsIndexing(exists, count) {
		slog.Info("índice principal já possui dados; ingestão ignorada", "index", cfg.IndexName)
		return nil
	}

	if !exists {
		if err := elastic.Create(ctx, client, cfg.IndexName, elastic.CursosMapping); err != nil {
			return err
		}
	}

	slog.Info("iniciando ingestão", "file", cfg.JSONFilePath, "index", cfg.IndexName)
	total, err := ingest.Documents(ctx, client, cfg)
	if err != nil {
		return fmt.Errorf("ingerir documentos (%d indexados): %w", total, err)
	}
	if err := elastic.Refresh(ctx, client, cfg.IndexName); err != nil {
		return err
	}
	slog.Info("ingestão concluída", "documentos", total, "index", cfg.IndexName)
	return nil
}

func ensureDicionario(ctx context.Context, client *elasticsearch.Client, cfg *config.Config) error {
	exists, count, err := indexState(ctx, client, cfg.DictIndexName)
	if err != nil {
		return err
	}
	if !needsIndexing(exists, count) {
		slog.Info("dicionário já possui dados; reconstrução ignorada", "index", cfg.DictIndexName)
		return nil
	}

	terms, err := dictionary.Build(ctx, client, cfg.IndexName, cfg.DictIndexName)
	if err != nil {
		return fmt.Errorf("construir dicionário: %w", err)
	}
	slog.Info("dicionário construído", "cursos_unicos", terms, "index", cfg.DictIndexName)
	return nil
}

// needsIndexing indica se o índice precisa ser populado, ou seja, se ainda não
// existe ou se existe sem documentos.
func needsIndexing(exists bool, count int64) bool {
	return !exists || count == 0
}

func indexState(ctx context.Context, client *elasticsearch.Client, index string) (bool, int64, error) {
	exists, err := elastic.Exists(ctx, client, index)
	if err != nil {
		return false, 0, err
	}
	if !exists {
		return false, 0, nil
	}

	count, err := elastic.DocCount(ctx, client, index)
	if err != nil {
		return true, 0, err
	}
	return true, count, nil
}
