package dictionary

import (
	"context"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"

	"bulker/internal/elastic"
)

func recreateIndex(ctx context.Context, client *elasticsearch.Client, spec Spec) error {
	exists, err := elastic.Exists(ctx, client, spec.TargetIndex)
	if err != nil {
		return err
	}
	if exists {
		if err := elastic.Delete(ctx, client, spec.TargetIndex); err != nil {
			return fmt.Errorf("remover índice de dicionário %s: %w", spec.TargetIndex, err)
		}
	}
	return elastic.Create(ctx, client, spec.TargetIndex, spec.Mapping)
}
