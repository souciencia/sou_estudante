package seed

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/config"
	"api_estudante/internal/elasticsearch"
	cursosingest "api_estudante/internal/features/cursos/ingest"
	"api_estudante/internal/features/ies"
	iesingest "api_estudante/internal/features/ies/ingest"
	"api_estudante/internal/ingest/bulk"
	"api_estudante/internal/ingest/dictionary"
	"api_estudante/internal/ingest/mappings"
	"api_estudante/internal/ingest/municipios"
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
	Now        func() time.Time
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
		Now: time.Now,
	}
}

// Run executa a ingestão por troca atômica de índice: ingere os dados num
// índice novo datado (<nome>-<AAAA-MM-DD>) e aponta o alias <nome>-latest para
// ele ao final. Se qualquer etapa falhar, o alias continua apontando para o
// índice anterior.
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
			CategoriaAdministrativa: doc.CategoriaAdministrativa.NoCategoriaAdministrativa,
			OrganizacaoAcademica:    doc.OrganizacaoAcademica.NoOrganizacaoAcademica,
		}
	}

	date := config.IndexDate(deps.Now())

	cursosSpec := indexSpec{
		name:    cfg.CursosIndexName,
		path:    cfg.JSONFilePath,
		mapping: mappings.Cursos,
		open: func(path string) (bulk.Stream, error) {
			return deps.OpenCursos(path, lookup)
		},
	}
	if err := ensureData(ctx, client, cfg, cursosSpec, date); err != nil {
		return err
	}

	iesSpec := indexSpec{
		name:    cfg.IESIndexName,
		path:    cfg.IESJSONFilePath,
		mapping: mappings.IES,
		open:    deps.OpenIES,
	}
	if err := ensureData(ctx, client, cfg, iesSpec, date); err != nil {
		return err
	}

	if err := ensureCursosDicionario(ctx, client, cfg, date); err != nil {
		return err
	}
	if err := ensureIESDicionario(ctx, client, cfg, iesDocs, date); err != nil {
		return err
	}
	return ensureMunicipios(ctx, client, cfg, date)
}

// ensureData ingere os documentos do arquivo de origem num índice novo datado
// (<name>-<AAAA-MM-DD>) e, ao final, troca o alias <name>-latest para ele de
// forma atômica, apagando o índice anterior. Se a ingestão falhar antes da
// troca, o alias continua apontando para o índice antigo, que permanece
// íntegro: nunca há dados parciais dados como completos.
func ensureData(ctx context.Context, client *es.Client, cfg *config.Config, spec indexSpec, date string) error {
	alias := config.LatestIndexName(spec.name)
	concrete := config.DatedIndexName(spec.name, date)

	// Remove um índice de mesmo nome de uma execução anterior que falhou no meio.
	if err := bulk.Delete(ctx, client, concrete); err != nil {
		return err
	}
	if err := bulk.Create(ctx, client, concrete, spec.mapping); err != nil {
		return err
	}

	stream, err := spec.open(spec.path)
	if err != nil {
		return fmt.Errorf("abrir arquivo de origem %s: %w", spec.path, err)
	}

	slog.Info("iniciando ingestão", "file", spec.path, "index", concrete)
	total, err := bulk.Run(ctx, client, concrete, cfg, stream)
	if err != nil {
		return fmt.Errorf("ingerir documentos (%d indexados): %w", total, err)
	}
	if err := bulk.Refresh(ctx, client, concrete); err != nil {
		return err
	}

	previous, err := bulk.AliasIndices(ctx, client, alias)
	if err != nil {
		return err
	}
	if err := bulk.PointAlias(ctx, client, alias, concrete, previous); err != nil {
		return err
	}

	for _, old := range previous {
		if old != concrete {
			if err := bulk.Delete(ctx, client, old); err != nil {
				return err
			}
		}
	}

	slog.Info("ingestão concluída", "documentos", total, "index", concrete)
	return nil
}

func ensureCursosDicionario(ctx context.Context, client *es.Client, cfg *config.Config, date string) error {
	return ensureDicionario(ctx, client, cfg, date, dictionary.Spec{
		SourceIndex: config.LatestIndexName(cfg.CursosIndexName),
		TargetIndex: cfg.DictIndexName,
		SourceField: cursosingest.DictionarySourceField,
		DocField:    cursosingest.DictionaryDocField,
		Mapping:     mappings.CursosDictionary,
	})
}

func ensureIESDicionario(ctx context.Context, client *es.Client, cfg *config.Config, docs map[string]ies.IES, date string) error {
	inserted, err := dictionary.BuildStream(ctx, client, cfg, cfg.IESDictIndexName, mappings.IESDictionary, iesingest.NewDictionaryStream(docs), date)
	if err != nil {
		return fmt.Errorf("construir dicionário %s: %w", cfg.IESDictIndexName, err)
	}
	slog.Info("dicionário construído", "termos_unicos", inserted, "index", cfg.IESDictIndexName)
	return nil
}

func ensureDicionario(ctx context.Context, client *es.Client, cfg *config.Config, date string, spec dictionary.Spec) error {
	terms, err := dictionary.Build(ctx, client, cfg, spec, date)
	if err != nil {
		return fmt.Errorf("construir dicionário %s: %w", spec.TargetIndex, err)
	}
	slog.Info("dicionário construído", "termos_unicos", terms, "index", spec.TargetIndex)
	return nil
}

// ensureMunicipios constrói o índice estados-municipios a partir dos municípios
// presentes nos índices de cursos e de IES já ingeridos, por troca atômica.
func ensureMunicipios(ctx context.Context, client *es.Client, cfg *config.Config, date string) error {
	stream, err := municipios.NewStream(ctx, client, []string{
		config.LatestIndexName(cfg.CursosIndexName),
		config.LatestIndexName(cfg.IESIndexName),
	})
	if err != nil {
		return fmt.Errorf("agregar municípios por UF: %w", err)
	}

	inserted, err := dictionary.BuildStream(ctx, client, cfg, cfg.MunicipiosIndexName, mappings.Municipios, stream, date)
	if err != nil {
		return fmt.Errorf("construir índice %s: %w", cfg.MunicipiosIndexName, err)
	}
	slog.Info("índice de municípios construído", "estados", inserted, "index", cfg.MunicipiosIndexName)
	return nil
}
