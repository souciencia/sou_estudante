package bulk

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"

	es "github.com/elastic/go-elasticsearch/v8"
)

// AliasIndices devolve os índices concretos que o alias aponta, ordenados.
// Devolve nil quando o alias não existe.
func AliasIndices(ctx context.Context, client *es.Client, alias string) ([]string, error) {
	res, err := client.Indices.GetAlias(
		client.Indices.GetAlias.WithName(alias),
		client.Indices.GetAlias.WithContext(ctx),
	)
	if err != nil {
		return nil, fmt.Errorf("listar índices do alias %s: %w", alias, err)
	}
	defer res.Body.Close()

	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.IsError() {
		return nil, fmt.Errorf("erro do elasticsearch ao listar o alias %s: %s", alias, res.String())
	}

	var body map[string]json.RawMessage
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return nil, fmt.Errorf("decodificar alias %s: %w", alias, err)
	}

	indices := make([]string, 0, len(body))
	for index := range body {
		indices = append(indices, index)
	}
	sort.Strings(indices)
	return indices, nil
}

// PointAlias aponta o alias para index, removendo-o dos índices em removeFrom.
// A troca é atômica: uma única chamada POST /_aliases.
func PointAlias(ctx context.Context, client *es.Client, alias, index string, removeFrom []string) error {
	actions := make([]map[string]any, 0, len(removeFrom)+1)
	for _, old := range removeFrom {
		actions = append(actions, map[string]any{
			"remove": map[string]any{"index": old, "alias": alias},
		})
	}
	actions = append(actions, map[string]any{
		"add": map[string]any{"index": index, "alias": alias},
	})

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(map[string]any{"actions": actions}); err != nil {
		return fmt.Errorf("montar ações de alias: %w", err)
	}

	res, err := client.Indices.UpdateAliases(
		bytes.NewReader(buf.Bytes()),
		client.Indices.UpdateAliases.WithContext(ctx),
	)
	if err != nil {
		return fmt.Errorf("atualizar alias %s: %w", alias, err)
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("erro do elasticsearch ao atualizar o alias %s: %s", alias, res.String())
	}
	return nil
}
