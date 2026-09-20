package dictionary

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"sync/atomic"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"

	"bulker/internal/elastic"
)

// Doc é um documento do índice de dicionário.
type Doc struct {
	NoCurso string `json:"no_curso"`
}

// Build recria o índice de dicionário a partir dos cursos únicos do índice de origem.
// Retorna a quantidade de termos inseridos.
func Build(ctx context.Context, client *elasticsearch.Client, sourceIndex, targetIndex string) (int, error) {
	if err := recreateIndex(ctx, client, targetIndex); err != nil {
		return 0, err
	}

	names, err := uniqueCursos(ctx, client, sourceIndex)
	if err != nil {
		return 0, err
	}

	inserted, err := indexNames(ctx, client, targetIndex, names)
	if err != nil {
		return 0, err
	}

	if err := elastic.Refresh(ctx, client, targetIndex); err != nil {
		return 0, err
	}
	return inserted, nil
}

func indexNames(ctx context.Context, client *elasticsearch.Client, index string, names []string) (int, error) {
	indexer, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{Index: index, Client: client})
	if err != nil {
		return 0, fmt.Errorf("criar bulk indexer do dicionário: %w", err)
	}

	var inserted int64
	for _, name := range names {
		body, err := json.Marshal(Doc{NoCurso: name})
		if err != nil {
			continue
		}
		item := esutil.BulkIndexerItem{
			Action: "index",
			Body:   bytes.NewReader(body),
			OnSuccess: func(context.Context, esutil.BulkIndexerItem, esutil.BulkIndexerResponseItem) {
				atomic.AddInt64(&inserted, 1)
			},
		}
		if err := indexer.Add(ctx, item); err != nil {
			return 0, fmt.Errorf("adicionar ao bulk do dicionário: %w", err)
		}
	}

	if err := indexer.Close(ctx); err != nil {
		return 0, fmt.Errorf("finalizar bulk do dicionário: %w", err)
	}
	return int(atomic.LoadInt64(&inserted)), nil
}
