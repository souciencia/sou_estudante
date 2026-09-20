package dictionary

import (
	"context"
	_ "embed"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"

	"bulker/internal/elastic"
)

// IndexMapping é o mapping do índice de dicionário, embutido no binário.
//
//go:embed mapping.json
var IndexMapping []byte

func recreateIndex(ctx context.Context, client *elasticsearch.Client, index string) error {
	exists, err := elastic.Exists(ctx, client, index)
	if err != nil {
		return err
	}
	if exists {
		if err := elastic.Delete(ctx, client, index); err != nil {
			return fmt.Errorf("remover índice de dicionário %s: %w", index, err)
		}
	}
	return elastic.Create(ctx, client, index, IndexMapping)
}
