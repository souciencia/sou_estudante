package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"
)

type DicionarioCursoDoc struct {
	NoCurso string `json:"no_curso"`
}

// DeduplicateCursos remove repetições, strings vazias e espaços extras mantendo unicidade O(1).
func DeduplicateCursos(names []string) []string {
	seen := make(map[string]struct{}, len(names))
	var result []string

	for _, name := range names {
		cleaned := strings.TrimSpace(name)
		if cleaned == "" {
			continue
		}
		if _, exists := seen[cleaned]; !exists {
			seen[cleaned] = struct{}{}
			result = append(result, cleaned)
		}
	}

	return result
}

// DicionarioIndexMapping define a estrutura do índice de dicionário para busca rápida e autocomplete.
const DicionarioIndexMapping = `{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "brazilian_search": {
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "no_curso": {
        "type": "search_as_you_type",
        "analyzer": "brazilian_search"
      }
    }
  }
}`

type compositeAggResponse struct {
	Aggregations struct {
		UniqueCursos struct {
			AfterKey map[string]interface{} `json:"after_key"`
			Buckets  []struct {
				Key struct {
					NoCurso string `json:"no_curso"`
				} `json:"key"`
			} `json:"buckets"`
		} `json:"unique_cursos"`
	} `json:"aggregations"`
}

// CreateDicionarioCursos percorre todos os valores únicos de curso.no_curso no índice cursos e cria o dicionario_cursos.
func CreateDicionarioCursos(ctx context.Context, client *elasticsearch.Client, sourceIndex, targetIndex string) (int, error) {
	// 1. Remover índice anterior se existir e criar com mapping de busca
	res, err := client.Indices.Exists([]string{targetIndex}, client.Indices.Exists.WithContext(ctx))
	if err == nil && res.StatusCode == 200 {
		_, _ = client.Indices.Delete([]string{targetIndex}, client.Indices.Delete.WithContext(ctx))
	}
	if res != nil && res.Body != nil {
		_ = res.Body.Close()
	}

	createRes, err := client.Indices.Create(
		targetIndex,
		client.Indices.Create.WithContext(ctx),
		client.Indices.Create.WithBody(strings.NewReader(DicionarioIndexMapping)),
	)
	if err != nil {
		return 0, fmt.Errorf("erro ao criar índice %s: %w", targetIndex, err)
	}
	defer createRes.Body.Close()
	if createRes.IsError() {
		return 0, fmt.Errorf("erro do elasticsearch ao criar índice %s: %s", targetIndex, createRes.String())
	}

	// 2. Extrair termos distintos usando composite aggregation com paginação
	uniqueSet := make(map[string]struct{})
	var afterKey map[string]interface{}

	for {
		compositeSource := map[string]interface{}{
			"size": 1000,
			"sources": []map[string]interface{}{
				{
					"no_curso": map[string]interface{}{
						"terms": map[string]interface{}{
							"field": "curso.no_curso.keyword",
						},
					},
				},
			},
		}
		if len(afterKey) > 0 {
			compositeSource["after"] = afterKey
		}

		queryBody := map[string]interface{}{
			"size": 0,
			"aggs": map[string]interface{}{
				"unique_cursos": map[string]interface{}{
					"composite": compositeSource,
				},
			},
		}

		bodyBytes, err := json.Marshal(queryBody)
		if err != nil {
			return 0, fmt.Errorf("erro ao serializar query de agregação: %w", err)
		}

		searchRes, err := client.Search(
			client.Search.WithContext(ctx),
			client.Search.WithIndex(sourceIndex),
			client.Search.WithBody(bytes.NewReader(bodyBytes)),
		)
		if err != nil {
			return 0, fmt.Errorf("erro ao buscar cursos únicos: %w", err)
		}

		body, err := io.ReadAll(searchRes.Body)
		_ = searchRes.Body.Close()
		if searchRes.IsError() {
			return 0, fmt.Errorf("erro na busca do elasticsearch: %s", string(body))
		}

		var aggResp compositeAggResponse
		if err := json.Unmarshal(body, &aggResp); err != nil {
			return 0, fmt.Errorf("erro ao decodificar agregação: %w", err)
		}

		buckets := aggResp.Aggregations.UniqueCursos.Buckets
		if len(buckets) == 0 {
			break
		}

		for _, b := range buckets {
			cleaned := strings.TrimSpace(b.Key.NoCurso)
			if cleaned != "" {
				uniqueSet[cleaned] = struct{}{}
			}
		}

		afterKey = aggResp.Aggregations.UniqueCursos.AfterKey
		if len(afterKey) == 0 {
			break
		}
	}

	// 3. Indexar termos únicos no índice de dicionário
	bi, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Index:  targetIndex,
		Client: client,
	})
	if err != nil {
		return 0, fmt.Errorf("erro ao instanciar BulkIndexer para dicionário: %w", err)
	}

	countInserted := 0
	for curso := range uniqueSet {
		docBytes, err := json.Marshal(DicionarioCursoDoc{NoCurso: curso})
		if err != nil {
			continue
		}

		err = bi.Add(ctx, esutil.BulkIndexerItem{
			Action: "index",
			Body:   bytes.NewReader(docBytes),
			OnSuccess: func(ctx context.Context, item esutil.BulkIndexerItem, res esutil.BulkIndexerResponseItem) {
				countInserted++
			},
		})
		if err != nil {
			return 0, fmt.Errorf("erro ao adicionar item ao bulk: %w", err)
		}
	}

	if err := bi.Close(ctx); err != nil {
		return 0, fmt.Errorf("erro ao finalizar indexação do dicionário: %w", err)
	}

	// Refresh para disponibilizar imediatamente para consultas
	_, _ = client.Indices.Refresh(client.Indices.Refresh.WithIndex(targetIndex), client.Indices.Refresh.WithContext(ctx))

	return countInserted, nil
}
