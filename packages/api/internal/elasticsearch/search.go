package elasticsearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"

	es "github.com/elastic/go-elasticsearch/v8"
)

// maxErrorBodyBytes limita quanto do corpo de erro do Elasticsearch entra na mensagem.
const maxErrorBodyBytes = 2048

// AggregationBucket representa um item de contagem de uma agregação do
// Elasticsearch, tanto de terms (array) quanto de filters (map).
type AggregationBucket struct {
	Key   string `json:"key"`
	Count int    `json:"count"`
}

// ParseBuckets converte o JSON bruto de uma agregação em buckets, aceitando
// tanto o formato de array (terms aggregation) quanto o de mapa
// (filters aggregation). Devolve nil quando a agregação não existe.
func ParseBuckets(aggregations map[string]json.RawMessage, name string) []AggregationBucket {
	raw, ok := aggregations[name]
	if !ok {
		return nil
	}
	return parseBucketsRaw(raw)
}

// ParseFilteredBuckets lê os buckets de uma agregação montada por FilteredAgg:
// um nó "filter" com um bucket interno nomeado "termos". Devolve nil quando a
// agregação não existe.
func ParseFilteredBuckets(aggregations map[string]json.RawMessage, name string) []AggregationBucket {
	raw, ok := aggregations[name]
	if !ok {
		return nil
	}

	var wrapper struct {
		Termos json.RawMessage `json:"termos"`
	}
	if err := json.Unmarshal(raw, &wrapper); err != nil || wrapper.Termos == nil {
		return nil
	}
	return parseBucketsRaw(wrapper.Termos)
}

// parseBucketsRaw converte o JSON de uma agregação (terms array ou filters map)
// em buckets ordenados de forma estável.
func parseBucketsRaw(raw json.RawMessage) []AggregationBucket {
	// 1. Tentar array buckets (ex: terms aggregation).
	var arrayAgg struct {
		Buckets []struct {
			Key      any `json:"key"`
			DocCount int `json:"doc_count"`
		} `json:"buckets"`
	}
	if err := json.Unmarshal(raw, &arrayAgg); err == nil && len(arrayAgg.Buckets) > 0 {
		buckets := make([]AggregationBucket, 0, len(arrayAgg.Buckets))
		for _, b := range arrayAgg.Buckets {
			buckets = append(buckets, AggregationBucket{
				Key:   fmt.Sprintf("%v", b.Key),
				Count: b.DocCount,
			})
		}
		return buckets
	}

	// 2. Tentar map buckets (ex: filters aggregation).
	var mapAgg struct {
		Buckets map[string]struct {
			DocCount int `json:"doc_count"`
		} `json:"buckets"`
	}
	if err := json.Unmarshal(raw, &mapAgg); err == nil && len(mapAgg.Buckets) > 0 {
		buckets := make([]AggregationBucket, 0, len(mapAgg.Buckets))
		for key, b := range mapAgg.Buckets {
			buckets = append(buckets, AggregationBucket{
				Key:   key,
				Count: b.DocCount,
			})
		}
		// A iteração de mapas é aleatória: ordena por contagem (como a terms
		// aggregation) e desempata pela chave, para a resposta ser estável.
		sort.Slice(buckets, func(i, j int) bool {
			if buckets[i].Count != buckets[j].Count {
				return buckets[i].Count > buckets[j].Count
			}
			return buckets[i].Key < buckets[j].Key
		})
		return buckets
	}

	return nil
}

// documentos já decodificados em T e as agregações cruas por nome.
type SearchResponse[T any] struct {
	Total        int
	Hits         []T
	Aggregations map[string]json.RawMessage
}

// ExecuteSearch serializa a query DSL, executa no índice informado e devolve
// os hits decodificados em T, o total exato e as agregações cruas.
func ExecuteSearch[T any](
	ctx context.Context,
	client *es.Client,
	index string,
	esQuery map[string]any,
) (*SearchResponse[T], error) {
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(esQuery); err != nil {
		return nil, fmt.Errorf("erro ao montar query: %w", err)
	}

	res, err := client.Search(
		client.Search.WithContext(ctx),
		client.Search.WithIndex(index),
		client.Search.WithBody(&buf),
		client.Search.WithTrackTotalHits(true),
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao executar search: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		// Lê o corpo bruto: se não for JSON válido, ainda assim vai para o erro
		// (que só é logado; a API não o expõe ao cliente).
		body, _ := io.ReadAll(io.LimitReader(res.Body, maxErrorBodyBytes))
		return nil, fmt.Errorf("erro ES [%s]: %s", res.Status(), strings.TrimSpace(string(body)))
	}

	var esResp struct {
		Hits struct {
			Total struct {
				Value int `json:"value"`
			} `json:"total"`
			Hits []struct {
				Source T `json:"_source"`
			} `json:"hits"`
		} `json:"hits"`
		Aggregations map[string]json.RawMessage `json:"aggregations"`
	}
	if err := json.NewDecoder(res.Body).Decode(&esResp); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta: %w", err)
	}

	hits := make([]T, 0, len(esResp.Hits.Hits))
	for _, hit := range esResp.Hits.Hits {
		hits = append(hits, hit.Source)
	}

	return &SearchResponse[T]{
		Total:        esResp.Hits.Total.Value,
		Hits:         hits,
		Aggregations: esResp.Aggregations,
	}, nil
}

// GetByID busca um documento pelo id no índice e desserializa o _source em T.
// O rótulo resource (ex.: "curso", "ies") entra nas mensagens de erro, e
// notFoundErr é devolvido quando o documento não existe.
func GetByID[T any](
	ctx context.Context,
	client *es.Client,
	index, id, resource string,
	notFoundErr error,
) (*T, error) {
	res, err := client.Get(
		index,
		id,
		client.Get.WithContext(ctx),
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar %s: %w", resource, err)
	}
	defer res.Body.Close()

	if res.StatusCode == http.StatusNotFound {
		return nil, notFoundErr
	}
	if res.IsError() {
		return nil, fmt.Errorf("erro ES [%s]", res.Status())
	}

	var parsed struct {
		Source T `json:"_source"`
	}
	if err := json.NewDecoder(res.Body).Decode(&parsed); err != nil {
		return nil, fmt.Errorf("erro ao decodificar %s: %w", resource, err)
	}

	return &parsed.Source, nil
}
