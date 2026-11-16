package bulk

import (
	"bytes"
	"context"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"
)

// Create cria o índice com o mapping informado.
func Create(ctx context.Context, client *elasticsearch.Client, index string, mapping []byte) error {
	res, err := client.Indices.Create(
		index,
		client.Indices.Create.WithContext(ctx),
		client.Indices.Create.WithBody(bytes.NewReader(mapping)),
	)
	if err != nil {
		return fmt.Errorf("criar índice %s: %w", index, err)
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("erro do elasticsearch ao criar %s: %s", index, res.String())
	}
	return nil
}

// Delete remove o índice, ignorando sua ausência.
func Delete(ctx context.Context, client *elasticsearch.Client, index string) error {
	res, err := client.Indices.Delete([]string{index}, client.Indices.Delete.WithContext(ctx))
	if err != nil {
		return fmt.Errorf("remover índice %s: %w", index, err)
	}
	defer res.Body.Close()
	if res.IsError() && res.StatusCode != 404 {
		return fmt.Errorf("erro do elasticsearch ao remover %s: %s", index, res.String())
	}
	return nil
}

// Refresh torna os documentos recém-indexados visíveis para busca.
func Refresh(ctx context.Context, client *elasticsearch.Client, index string) error {
	res, err := client.Indices.Refresh(
		client.Indices.Refresh.WithIndex(index),
		client.Indices.Refresh.WithContext(ctx),
	)
	if err != nil {
		return fmt.Errorf("atualizar índice %s: %w", index, err)
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("erro do elasticsearch ao atualizar %s: %s", index, res.String())
	}
	return nil
}
