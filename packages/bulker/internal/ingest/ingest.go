package ingest

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"sync/atomic"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"

	"bulker/internal/config"
	"bulker/internal/elastic"
)

const progressInterval = 500

// Document é um registro já mapeado, pronto para ser indexado.
type Document struct {
	ID   string
	Body any
}

// Stream fornece documentos prontos para indexação, um a um.
// Next deve retornar io.EOF quando não houver mais registros.
type Stream interface {
	Next() (*Document, error)
	Close() error
}

// Run consome o stream e indexa cada documento no índice informado.
// Retorna a quantidade de documentos indexados com sucesso.
func Run(ctx context.Context, client *elasticsearch.Client, index string, cfg *config.Config, stream Stream) (uint64, error) {
	defer stream.Close()

	indexer, err := elastic.NewBulkIndexer(client, index, cfg)
	if err != nil {
		return 0, fmt.Errorf("criar bulk indexer: %w", err)
	}

	var indexed, failed uint64

	for {
		if err := ctx.Err(); err != nil {
			_ = indexer.Close(context.Background())
			return atomic.LoadUint64(&indexed), err
		}

		doc, err := stream.Next()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			slog.Warn("registro ignorado", "error", err)
			continue
		}

		item, err := newItem(*doc, &indexed, &failed)
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
	if rejected := atomic.LoadUint64(&failed); rejected > 0 {
		slog.Warn("documentos rejeitados pelo elasticsearch", "index", index, "rejeitados", rejected)
	}
	return atomic.LoadUint64(&indexed), nil
}

func newItem(doc Document, indexed, failed *uint64) (esutil.BulkIndexerItem, error) {
	body, err := json.Marshal(doc.Body)
	if err != nil {
		return esutil.BulkIndexerItem{}, err
	}

	item := esutil.BulkIndexerItem{
		Action: "index",
		Body:   bytes.NewReader(body),
	}
	if doc.ID != "" {
		item.DocumentID = doc.ID
	}
	item.OnSuccess = func(context.Context, esutil.BulkIndexerItem, esutil.BulkIndexerResponseItem) {
		if count := atomic.AddUint64(indexed, 1); count%progressInterval == 0 {
			slog.Info("progresso da ingestão", "documentos", count)
		}
	}
	item.OnFailure = func(_ context.Context, it esutil.BulkIndexerItem, resp esutil.BulkIndexerResponseItem, err error) {
		atomic.AddUint64(failed, 1)
		slog.Warn("documento rejeitado pelo elasticsearch", "id", it.DocumentID, "status", resp.Status, "error", err)
	}
	return item, nil
}
