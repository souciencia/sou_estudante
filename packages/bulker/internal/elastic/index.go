package elastic

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"
)

// Exists informa se o índice existe.
func Exists(ctx context.Context, client *elasticsearch.Client, index string) (bool, error) {
	res, err := client.Indices.Exists([]string{index}, client.Indices.Exists.WithContext(ctx))
	if err != nil {
		return false, fmt.Errorf("verificar existência do índice %s: %w", index, err)
	}
	defer res.Body.Close()
	return res.StatusCode == 200, nil
}

// DocCount retorna a quantidade de documentos do índice.
func DocCount(ctx context.Context, client *elasticsearch.Client, index string) (int64, error) {
	res, err := client.Count(client.Count.WithContext(ctx), client.Count.WithIndex(index))
	if err != nil {
		return 0, fmt.Errorf("contar documentos de %s: %w", index, err)
	}
	defer res.Body.Close()
	if res.IsError() {
		return 0, fmt.Errorf("erro do elasticsearch ao contar %s: %s", index, res.String())
	}

	var body struct {
		Count int64 `json:"count"`
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return 0, fmt.Errorf("decodificar contagem de %s: %w", index, err)
	}
	return body.Count, nil
}

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
