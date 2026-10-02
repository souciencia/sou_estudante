package dictionary

import (
	"context"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/ingest/bulk"
)

func recreateIndex(ctx context.Context, client *elasticsearch.Client, spec Spec) error {
	exists, err := bulk.Exists(ctx, client, spec.TargetIndex)
	if err != nil {
		return err
	}
	if exists {
		if err := bulk.Delete(ctx, client, spec.TargetIndex); err != nil {
			return fmt.Errorf("remover índice de dicionário %s: %w", spec.TargetIndex, err)
		}
	}
	return bulk.Create(ctx, client, spec.TargetIndex, spec.Mapping)
}
