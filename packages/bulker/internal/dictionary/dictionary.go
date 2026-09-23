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

// Spec descreve como construir um índice de dicionário a partir de um campo
// termo do índice de origem.
type Spec struct {
	SourceIndex string
	TargetIndex string
	SourceField string
	DocField    string
	Mapping     []byte
}

// Build recria o índice de dicionário a partir dos termos únicos do índice de
// origem. Retorna a quantidade de termos inseridos.
func Build(ctx context.Context, client *elasticsearch.Client, spec Spec) (int, error) {
	if err := recreateIndex(ctx, client, spec); err != nil {
		return 0, err
	}

	terms, err := uniqueTerms(ctx, client, spec.SourceIndex, spec.SourceField)
	if err != nil {
		return 0, err
	}

	inserted, err := indexTerms(ctx, client, spec.TargetIndex, spec.DocField, terms)
	if err != nil {
		return 0, err
	}

	if err := elastic.Refresh(ctx, client, spec.TargetIndex); err != nil {
		return 0, err
	}
	return inserted, nil
}

func indexTerms(ctx context.Context, client *elasticsearch.Client, index, docField string, terms []string) (int, error) {
	indexer, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{Index: index, Client: client})
	if err != nil {
		return 0, fmt.Errorf("criar bulk indexer do dicionário: %w", err)
	}

	var inserted int64
	for _, term := range terms {
		body, err := json.Marshal(map[string]string{docField: term})
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
