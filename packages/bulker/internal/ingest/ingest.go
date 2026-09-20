package ingest

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"strconv"
	"sync/atomic"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"

	"bulker/internal/config"
	"bulker/internal/elastic"
	"bulker/internal/mapper"
	"bulker/internal/model"
	"bulker/internal/source"
)

const progressInterval = 500

// Documents lê o arquivo de origem e indexa cada registro no índice principal.
// Retorna a quantidade de documentos indexados com sucesso.
func Documents(ctx context.Context, client *elasticsearch.Client, cfg *config.Config) (uint64, error) {
	indexer, err := elastic.NewBulkIndexer(client, cfg.IndexName, cfg)
	if err != nil {
		return 0, fmt.Errorf("criar bulk indexer: %w", err)
	}

	reader, err := source.Open(cfg.JSONFilePath)
	if err != nil {
		return 0, fmt.Errorf("abrir arquivo de origem %s: %w", cfg.JSONFilePath, err)
	}
	defer reader.Close()

	var indexed uint64

	for {
		if err := ctx.Err(); err != nil {
			_ = indexer.Close(context.Background())
			return atomic.LoadUint64(&indexed), err
		}

		record, err := reader.Next()
		if source.IsEOF(err) {
			break
		}
		if err != nil {
			slog.Warn("registro ignorado", "error", err)
			continue
		}

		item, err := newItem(mapper.ToDocument(*record), &indexed)
		if err != nil {
			slog.Warn("registro ignorado", "error", err)
			continue
		}

		if err := indexer.Add(ctx, item); err != nil {
			_ = indexer.Close(context.Background())
			return atomic.LoadUint64(&indexed), fmt.Errorf("adicionar ao bulk: %w", err)
		}
	}

	if err := indexer.Close(ctx); err != nil {
		return atomic.LoadUint64(&indexed), fmt.Errorf("finalizar bulk: %w", err)
	}
	return atomic.LoadUint64(&indexed), nil
}

func newItem(doc model.Document, indexed *uint64) (esutil.BulkIndexerItem, error) {
	body, err := json.Marshal(doc)
	if err != nil {
		return esutil.BulkIndexerItem{}, err
	}

	item := esutil.BulkIndexerItem{
		Action: "index",
		Body:   bytes.NewReader(body),
	}
	if doc.Sequencial != nil {
		item.DocumentID = strconv.FormatInt(*doc.Sequencial, 10)
	}
	item.OnSuccess = func(context.Context, esutil.BulkIndexerItem, esutil.BulkIndexerResponseItem) {
		if count := atomic.AddUint64(indexed, 1); count%progressInterval == 0 {
			slog.Info("progresso da ingestão", "documentos", count)
		}
	}
	return item, nil
}
