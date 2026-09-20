package dictionary

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"sort"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"
)

const (
	aggregationName = "unique_cursos"
	sourceField     = "curso.no_curso.keyword"
	pageSize        = 1000
)

type compositeResponse struct {
	Aggregations compositeAggregations `json:"aggregations"`
}

type compositeAggregations struct {
	Unique compositeAggregation `json:"unique_cursos"`
}

type compositeAggregation struct {
	AfterKey map[string]any    `json:"after_key"`
	Buckets  []compositeBucket `json:"buckets"`
}

type compositeBucket struct {
	Key compositeKey `json:"key"`
}

type compositeKey struct {
	NoCurso string `json:"no_curso"`
}

// uniqueCursos extrai os nomes de curso distintos do índice de origem, ordenados.
func uniqueCursos(ctx context.Context, client *elasticsearch.Client, index string) ([]string, error) {
	seen := make(map[string]struct{})
	var afterKey map[string]any

	for {
		query, err := aggregateQuery(afterKey)
		if err != nil {
			return nil, fmt.Errorf("montar agregação: %w", err)
		}

		body, err := search(ctx, client, index, query)
		if err != nil {
			return nil, err
		}

		var parsed compositeResponse
		if err := json.Unmarshal(body, &parsed); err != nil {
			return nil, fmt.Errorf("decodificar agregação: %w", err)
		}

		buckets := parsed.Aggregations.Unique.Buckets
		for _, bucket := range buckets {
			if name := strings.TrimSpace(bucket.Key.NoCurso); name != "" {
				seen[name] = struct{}{}
			}
		}

		afterKey = parsed.Aggregations.Unique.AfterKey
		if len(buckets) == 0 || len(afterKey) == 0 {
			break
		}
	}

	names := make([]string, 0, len(seen))
	for name := range seen {
		names = append(names, name)
	}
	sort.Strings(names)
	return names, nil
}

func aggregateQuery(afterKey map[string]any) ([]byte, error) {
	composite := map[string]any{
		"size": pageSize,
		"sources": []map[string]any{
			{"no_curso": map[string]any{"terms": map[string]any{"field": sourceField}}},
		},
	}
	if len(afterKey) > 0 {
		composite["after"] = afterKey
	}

	return json.Marshal(map[string]any{
		"size": 0,
		"aggs": map[string]any{
			aggregationName: map[string]any{"composite": composite},
		},
	})
}

func search(ctx context.Context, client *elasticsearch.Client, index string, query []byte) ([]byte, error) {
	res, err := client.Search(
		client.Search.WithContext(ctx),
		client.Search.WithIndex(index),
		client.Search.WithBody(bytes.NewReader(query)),
	)
	if err != nil {
		return nil, fmt.Errorf("buscar cursos únicos: %w", err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("ler resposta da busca: %w", err)
	}
	if res.IsError() {
		return nil, fmt.Errorf("erro do elasticsearch na busca: %s", string(body))
	}
	return body, nil
}
