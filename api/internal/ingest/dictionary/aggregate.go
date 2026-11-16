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
	aggregationName = "unique_terms"
	termSourceName  = "term"
	pageSize        = 1000
)

type compositeResponse struct {
	Aggregations compositeAggregations `json:"aggregations"`
}

type compositeAggregations struct {
	Unique compositeAggregation `json:"unique_terms"`
}

type compositeAggregation struct {
	AfterKey map[string]any    `json:"after_key"`
	Buckets  []compositeBucket `json:"buckets"`
}

type compositeBucket struct {
	Key      compositeKey `json:"key"`
	DocCount int          `json:"doc_count"`
}

type compositeKey struct {
	Term string `json:"term"`
}

// termCount associa um termo único do índice de origem à quantidade de
// documentos que o possuem.
type termCount struct {
	term  string
	count int
}

// uniqueTerms extrai os termos distintos de field no índice de origem, com a
// contagem de documentos de cada um, ordenados por termo.
func uniqueTerms(ctx context.Context, client *elasticsearch.Client, index, field string) ([]termCount, error) {
	seen := make(map[string]int)
	var afterKey map[string]any

	for {
		query, err := aggregateQuery(afterKey, field)
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
			if term := strings.TrimSpace(bucket.Key.Term); term != "" {
				seen[term] = bucket.DocCount
			}
		}

		afterKey = parsed.Aggregations.Unique.AfterKey
		if len(buckets) == 0 || len(afterKey) == 0 {
			break
		}
	}

	terms := make([]termCount, 0, len(seen))
	for term, count := range seen {
		terms = append(terms, termCount{term: term, count: count})
	}
	sort.Slice(terms, func(i, j int) bool { return terms[i].term < terms[j].term })
	return terms, nil
}

func aggregateQuery(afterKey map[string]any, field string) ([]byte, error) {
	composite := map[string]any{
		"size": pageSize,
		"sources": []map[string]any{
			{termSourceName: map[string]any{"terms": map[string]any{"field": field}}},
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
		return nil, fmt.Errorf("buscar termos únicos: %w", err)
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
