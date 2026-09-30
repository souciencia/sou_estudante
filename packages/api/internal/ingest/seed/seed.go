package seed

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/config"
	"api_estudante/internal/elasticsearch"
	cursosingest "api_estudante/internal/features/cursos/ingest"
	"api_estudante/internal/features/ies"
	iesingest "api_estudante/internal/features/ies/ingest"
	"api_estudante/internal/ingest/bulk"
	"api_estudante/internal/ingest/dictionary"
	"api_estudante/internal/ingest/mappings"
)

// indexSpec descreve um índice a ser populado a partir de um arquivo de origem.
type indexSpec struct {
	name    string
	path    string
	mapping []byte
	open    func(path string) (bulk.Stream, error)
}

// Deps reúne as dependências externas do Run, permitindo injetá-las nos testes.
type Deps struct {
	NewClient  func(url, apiKey string) (*es.Client, error)
	Stat       func(path string) error
	LoadIES    func(path string) (map[string]ies.IES, error)
	OpenCursos func(path string, lookup map[string]cursosingest.InstituicaoInfo) (bulk.Stream, error)
	OpenIES    func(path string) (bulk.Stream, error)
}

func defaultDeps() Deps {
	return Deps{
		NewClient: elasticsearch.NewClient,
		Stat: func(path string) error {
			_, err := os.Stat(path)
			return err
		},
		LoadIES: iesingest.Documents,
		OpenCursos: func(path string, lookup map[string]cursosingest.InstituicaoInfo) (bulk.Stream, error) {
			return cursosingest.NewStream(path, lookup)
		},
		OpenIES: func(path string) (bulk.Stream, error) {
			return iesingest.NewStream(path)
		},
	}
}

// Run executa a ingestão de forma idempotente: garante os índices e seus dados
// e encerra. Se os dados já existirem, nada é reindexado.
func Run(ctx context.Context, cfg *config.Config) error {
	return run(ctx, cfg, defaultDeps())
}

func run(ctx context.Context, cfg *config.Config, deps Deps) error {
	if cfg.ESIngestAPIKey == "" {
		return fmt.Errorf("ES_INGEST_APIKEY não definida")
	}
	if err := deps.Stat(cfg.JSONFilePath); err != nil {
		return fmt.Errorf("arquivo de origem indisponível %s: %w", cfg.JSONFilePath, err)
	}
	if err := deps.Stat(cfg.IESJSONFilePath); err != nil {
		return fmt.Errorf("arquivo de origem indisponível %s: %w", cfg.IESJSONFilePath, err)
	}

	client, err := deps.NewClient(cfg.ESURL, cfg.ESIngestAPIKey)
	if err != nil {
		return fmt.Errorf("criar cliente elasticsearch: %w", err)
	}

	iesDocs, err := deps.LoadIES(cfg.IESJSONFilePath)
	if err != nil {
		return fmt.Errorf("carregar dados de IES: %w", err)
	}
	lookup := make(map[string]cursosingest.InstituicaoInfo, len(iesDocs))
	for coIES, doc := range iesDocs {
		lookup[coIES] = cursosingest.InstituicaoInfo{
			NoIES:                   doc.NoIES,
			SgIES:                   doc.SgIES,
			CategoriaAdministrativa: doc.CategoriaAdministrativa,
			OrganizacaoAcademica:    doc.OrganizacaoAcademica,
		}
	}

	cursosSpec := indexSpec{
		name:    cfg.CursosIndexName,
		path:    cfg.JSONFilePath,
		mapping: mappings.Cursos,
		open: func(path string) (bulk.Stream, error) {
			return deps.OpenCursos(path, lookup)
		},
	}
	if err := ensureData(ctx, client, cfg, cursosSpec); err != nil {
		return err
	}

	iesSpec := indexSpec{
		name:    cfg.IESIndexName,
		path:    cfg.IESJSONFilePath,
		mapping: mappings.IES,
		open:    deps.OpenIES,
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
func ensureData(ctx context.Context, client *es.Client, cfg *config.Config, spec indexSpec) error {
	exists, count, err := indexState(ctx, client, spec.name)
	if err != nil {
		return err
	}
	if !needsIndexing(exists, count) {
		slog.Info("índice já possui dados; ingestão ignorada", "index", spec.name)
		return nil
	}

	if !exists {
		if err := bulk.Create(ctx, client, spec.name, spec.mapping); err != nil {
			return err
		}
	}

	stream, err := spec.open(spec.path)
	if err != nil {
		return fmt.Errorf("abrir arquivo de origem %s: %w", spec.path, err)
	}

	slog.Info("iniciando ingestão", "file", spec.path, "index", spec.name)
	total, err := bulk.Run(ctx, client, spec.name, cfg, stream)
	if err != nil {
		return fmt.Errorf("ingerir documentos (%d indexados): %w", total, err)
	}
	if err := bulk.Refresh(ctx, client, spec.name); err != nil {
		return err
	}
	slog.Info("ingestão concluída", "documentos", total, "index", spec.name)
	return nil
}

func ensureCursosDicionario(ctx context.Context, client *es.Client, cfg *config.Config) error {
	return ensureDicionario(ctx, client, cfg, dictionary.Spec{
		SourceIndex: cfg.CursosIndexName,
		TargetIndex: cfg.DictIndexName,
		SourceField: cursosingest.DictionarySourceField,
		DocField:    cursosingest.DictionaryDocField,
		Mapping:     mappings.CursosDictionary,
	})
}

func ensureIESDicionario(ctx context.Context, client *es.Client, cfg *config.Config) error {
	return ensureDicionario(ctx, client, cfg, dictionary.Spec{
		SourceIndex: cfg.IESIndexName,
		TargetIndex: cfg.IESDictIndexName,
		SourceField: iesingest.DictionarySourceField,
		DocField:    iesingest.DictionaryDocField,
		Mapping:     mappings.IESDictionary,
	})
}

func ensureDicionario(ctx context.Context, client *es.Client, cfg *config.Config, spec dictionary.Spec) error {
	exists, count, err := indexState(ctx, client, spec.TargetIndex)
	if err != nil {
		return err
	}
	if !needsIndexing(exists, count) {
		slog.Info("dicionário já possui dados; reconstrução ignorada", "index", spec.TargetIndex)
		return nil
	}

	terms, err := dictionary.Build(ctx, client, cfg, spec)
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

func indexState(ctx context.Context, client *es.Client, index string) (bool, int64, error) {
	exists, err := bulk.Exists(ctx, client, index)
	if err != nil {
		return false, 0, err
	}
	if !exists {
		return false, 0, nil
	}

	count, err := bulk.DocCount(ctx, client, index)
	if err != nil {
		return true, 0, err
	}
	return true, count, nil
}
