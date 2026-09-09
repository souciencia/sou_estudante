package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"sync/atomic"
	"time"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"
)

type apiKeyResponse struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	APIKey  string `json:"api_key"`
	Encoded string `json:"encoded"`
}

// CheckESHealth verifica a conectividade e status do cluster Elasticsearch.
func CheckESHealth(ctx context.Context, client *elasticsearch.Client) (bool, string, error) {
	res, err := client.Cluster.Health(
		client.Cluster.Health.WithContext(ctx),
		client.Cluster.Health.WithTimeout(5*time.Second),
	)
	if err != nil {
		return false, "", fmt.Errorf("falha ao conectar no Elasticsearch: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return false, "", fmt.Errorf("resposta com erro do cluster: %s", res.Status())
	}

	var health struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(res.Body).Decode(&health); err != nil {
		return true, "online", nil
	}

	return true, health.Status, nil
}

// GenerateAPIKey gera uma nova API key no Elasticsearch via HTTP Basic Auth.
func GenerateAPIKey(ctx context.Context, esURL, username, password, keyName string) (string, error) {
	reqBody, err := json.Marshal(map[string]string{
		"name": keyName,
	})
	if err != nil {
		return "", fmt.Errorf("erro ao montar payload para api key: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", fmt.Sprintf("%s/_security/api_key", esURL), bytes.NewReader(reqBody))
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if username != "" && password != "" {
		req.SetBasicAuth(username, password)
	}

	httpClient := &http.Client{Timeout: 10 * time.Second}
	res, err := httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro na chamada à API de segurança: %w", err)
	}
	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return "", fmt.Errorf("erro ao ler resposta: %w", err)
	}

	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("erro ao gerar api key (%d): %s", res.StatusCode, string(bodyBytes))
	}

	var keyResp apiKeyResponse
	if err := json.Unmarshal(bodyBytes, &keyResp); err != nil {
		return "", fmt.Errorf("erro ao decodificar resposta da api key: %w", err)
	}

	if keyResp.Encoded != "" {
		return keyResp.Encoded, nil
	}

	return "", fmt.Errorf("resposta não continha campo 'encoded'")
}

// ResetDatabase remove os índices existentes e recria o índice principal a partir do mapping.json.
func ResetDatabase(ctx context.Context, client *elasticsearch.Client, indices []string, mappingPath string) error {
	for _, idx := range indices {
		res, err := client.Indices.Exists([]string{idx}, client.Indices.Exists.WithContext(ctx))
		if err == nil && res.StatusCode == 200 {
			delRes, delErr := client.Indices.Delete([]string{idx}, client.Indices.Delete.WithContext(ctx))
			if delErr == nil && delRes != nil && delRes.Body != nil {
				_ = delRes.Body.Close()
			}
		}
		if res != nil && res.Body != nil {
			_ = res.Body.Close()
		}
	}

	if mappingPath != "" {
		mappingData, err := os.ReadFile(mappingPath)
		if err == nil {
			mainIdx := indices[0]
			createRes, err := client.Indices.Create(
				mainIdx,
				client.Indices.Create.WithContext(ctx),
				client.Indices.Create.WithBody(bytes.NewReader(mappingData)),
			)
			if err != nil {
				return fmt.Errorf("erro ao recriar índice %s: %w", mainIdx, err)
			}
			defer createRes.Body.Close()
			if createRes.IsError() {
				return fmt.Errorf("erro ao criar índice %s: %s", mainIdx, createRes.String())
			}
		}
	}

	return nil
}

// IngestDataFile lê os dados do arquivo JSON e insere em lote no Elasticsearch.
func IngestDataFile(ctx context.Context, client *elasticsearch.Client, cfg *Config, filePath string, progressCb func(count uint64)) (uint64, error) {
	bi, err := NewBulkIndexer(client, cfg)
	if err != nil {
		return 0, fmt.Errorf("erro ao criar Bulk Indexer: %w", err)
	}

	jsonReader, err := NewJSONReader(filePath)
	if err != nil {
		return 0, fmt.Errorf("erro ao abrir arquivo JSON (%s): %w", filePath, err)
	}
	defer jsonReader.Close()

	var countSuccessful uint64

	for {
		select {
		case <-ctx.Done():
			_ = bi.Close(context.Background())
			return atomic.LoadUint64(&countSuccessful), ctx.Err()
		default:
		}

		rec, err := jsonReader.ReadRecord()
		if jsonReader.IsEOF(err) {
			break
		}
		if err != nil {
			continue
		}

		doc := mapSourceToDocument(*rec)
		docBytes, err := json.Marshal(doc)
		if err != nil {
			continue
		}

		docID := ""
		if rec.Sequencial != nil {
			docID = strconv.FormatInt(*rec.Sequencial, 10)
		}

		err = bi.Add(ctx, esutil.BulkIndexerItem{
			Action:     "index",
			DocumentID: docID,
			Body:       bytes.NewReader(docBytes),
			OnSuccess: func(ctx context.Context, item esutil.BulkIndexerItem, res esutil.BulkIndexerResponseItem) {
				c := atomic.AddUint64(&countSuccessful, 1)
				if progressCb != nil && c%500 == 0 {
					progressCb(c)
				}
			},
		})
		if err != nil {
			_ = bi.Close(context.Background())
			return atomic.LoadUint64(&countSuccessful), fmt.Errorf("erro no bulk indexer add: %w", err)
		}
	}

	if err := bi.Close(ctx); err != nil {
		return atomic.LoadUint64(&countSuccessful), fmt.Errorf("erro ao fechar bulk indexer: %w", err)
	}

	total := atomic.LoadUint64(&countSuccessful)
	if progressCb != nil {
		progressCb(total)
	}

	return total, nil
}
