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
	"bulker/internal/features/cursos"
	"bulker/internal/features/ies"
	"bulker/internal/ingest"
)

// indexSpec descreve um índice a ser populado a partir de um arquivo de origem.
type indexSpec struct {
	name    string
	path    string
	mapping []byte
	open    func(path string) (ingest.Stream, error)
}

// Run executa o bulking de forma idempotente: garante os índices e seus dados
// e encerra. Se os dados já existirem, nada é reindexado.
func Run(ctx context.Context, cfg *config.Config) error {
	if cfg.ElasticsearchAPIKey == "" {
		return fmt.Errorf("ELASTICSEARCH_APIKEY não definida")
	}
	if _, err := os.Stat(cfg.JSONFilePath); err != nil {
		return fmt.Errorf("arquivo de origem indisponível %s: %w", cfg.JSONFilePath, err)
	}
	if _, err := os.Stat(cfg.IESJSONFilePath); err != nil {
		return fmt.Errorf("arquivo de origem indisponível %s: %w", cfg.IESJSONFilePath, err)
	}

	client, err := elastic.NewClient(cfg)
	if err != nil {
		return fmt.Errorf("criar cliente elasticsearch: %w", err)
	}

	iesDocs, err := ies.Documents(cfg.IESJSONFilePath)
	if err != nil {
		return fmt.Errorf("carregar dados de IES: %w", err)
	}
	lookup := make(map[string]cursos.InstituicaoInfo, len(iesDocs))
	for coIES, doc := range iesDocs {
		lookup[coIES] = cursos.InstituicaoInfo{
			NoIES:                   doc.NoIES,
			SgIES:                   doc.SgIES,
			CategoriaAdministrativa: doc.CategoriaAdministrativa,
			OrganizacaoAcademica:    doc.OrganizacaoAcademica,
		}
	}

	cursosSpec := indexSpec{
		name:    cfg.IndexName,
		path:    cfg.JSONFilePath,
		mapping: cursos.Mapping,
		open: func(path string) (ingest.Stream, error) {
			return cursos.NewStream(path, lookup)
		},
	}
	if err := ensureData(ctx, client, cfg, cursosSpec); err != nil {
		return err
	}

	iesSpec := indexSpec{
		name:    cfg.IESIndexName,
		path:    cfg.IESJSONFilePath,
		mapping: ies.Mapping,
		open: func(path string) (ingest.Stream, error) {
			return ies.NewStream(path)
		},
	}
	if err := ensureData(ctx, client, cfg, iesSpec); err != nil {
		return err
	}

	if err := ensureCursosDicionario(ctx, client, cfg); err != nil {
		return err
	}
	return ensureIESDicionario(ctx, client, cfg)
}

// ensureData cria o índice (se necessário) e ingere os documentos do arquivo
// de origem caso o índice ainda não possua dados.
func ensureData(ctx context.Context, client *elasticsearch.Client, cfg *config.Config, spec indexSpec) error {
	exists, count, err := indexState(ctx, client, spec.name)
	if err != nil {
		return err
	}
	if !needsIndexing(exists, count) {
		slog.Info("índice já possui dados; ingestão ignorada", "index", spec.name)
		return nil
	}

	if !exists {
		if err := elastic.Create(ctx, client, spec.name, spec.mapping); err != nil {
			return err
		}
	}

	stream, err := spec.open(spec.path)
	if err != nil {
		return fmt.Errorf("abrir arquivo de origem %s: %w", spec.path, err)
	}

	slog.Info("iniciando ingestão", "file", spec.path, "index", spec.name)
	total, err := ingest.Run(ctx, client, spec.name, cfg, stream)
	if err != nil {
		return fmt.Errorf("ingerir documentos (%d indexados): %w", total, err)
	}
	if err := elastic.Refresh(ctx, client, spec.name); err != nil {
		return err
	}
	slog.Info("ingestão concluída", "documentos", total, "index", spec.name)
	return nil
}

func ensureCursosDicionario(ctx context.Context, client *elasticsearch.Client, cfg *config.Config) error {
	return ensureDicionario(ctx, client, dictionary.Spec{
		SourceIndex: cfg.IndexName,
		TargetIndex: cfg.DictIndexName,
		SourceField: cursos.DictionarySourceField,
		DocField:    cursos.DictionaryDocField,
		Mapping:     cursos.DictionaryMapping,
	})
}

func ensureIESDicionario(ctx context.Context, client *elasticsearch.Client, cfg *config.Config) error {
	return ensureDicionario(ctx, client, dictionary.Spec{
		SourceIndex: cfg.IESIndexName,
		TargetIndex: cfg.IESDictIndexName,
		SourceField: ies.DictionarySourceField,
		DocField:    ies.DictionaryDocField,
		Mapping:     ies.DictionaryMapping,
	})
}

func ensureDicionario(ctx context.Context, client *elasticsearch.Client, spec dictionary.Spec) error {
	exists, count, err := indexState(ctx, client, spec.TargetIndex)
	if err != nil {
		return err
	}
	if !needsIndexing(exists, count) {
		slog.Info("dicionário já possui dados; reconstrução ignorada", "index", spec.TargetIndex)
		return nil
	}

	terms, err := dictionary.Build(ctx, client, spec)
	if err != nil {
		return fmt.Errorf("construir dicionário %s: %w", spec.TargetIndex, err)
	}
	slog.Info("dicionário construído", "termos_unicos", terms, "index", spec.TargetIndex)
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
