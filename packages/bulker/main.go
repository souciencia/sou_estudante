package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"strconv"
	"sync/atomic"
	"time"

	"github.com/elastic/go-elasticsearch/v8/esutil"
)

func main() {
	cfg := LoadConfig()

	log.Printf("Iniciando bulker com arquivo %s no índice '%s'...", cfg.JSONFilePath, cfg.IndexName)

	es, err := NewElasticsearchClient(cfg)
	if err != nil {
		log.Fatalf("Erro ao criar cliente ES: %s", err)
	}

	bi, err := NewBulkIndexer(es, cfg)
	if err != nil {
		log.Fatalf("Erro ao criar Bulk Indexer: %s", err)
	}

	jsonReader, err := NewJSONReader(cfg.JSONFilePath)
	if err != nil {
		log.Fatalf("Erro ao abrir arquivo JSON: %s", err)
	}
	defer jsonReader.Close()

	var countSuccessful uint64
	start := time.Now()

	log.Printf("Processando registros do JSON...")

	for {
		rec, err := jsonReader.ReadRecord()
		if jsonReader.IsEOF(err) {
			break
		}
		if err != nil {
			log.Printf("Erro ao ler registro: %v", err)
			continue
		}

		doc := mapSourceToDocument(*rec)
		docBytes, err := json.Marshal(doc)
		if err != nil {
			log.Printf("Erro ao serializar JSON: %v", err)
			continue
		}

		docID := ""
		if rec.Sequencial != nil {
			docID = strconv.FormatInt(*rec.Sequencial, 10)
		}

		err = bi.Add(context.Background(), esutil.BulkIndexerItem{
			Action:     "index",
			DocumentID: docID,
			Body:       bytes.NewReader(docBytes),
			OnSuccess: func(ctx context.Context, item esutil.BulkIndexerItem, res esutil.BulkIndexerResponseItem) {
				atomic.AddUint64(&countSuccessful, 1)
			},
			OnFailure: func(ctx context.Context, item esutil.BulkIndexerItem, res esutil.BulkIndexerResponseItem, err error) {
				if err != nil {
					log.Printf("Erro na inserção: %s", err)
				} else {
					log.Printf("Erro na inserção (%d): %s", res.Status, res.Error.Reason)
				}
			},
		})
		if err != nil {
			log.Fatalf("Erro ao adicionar item ao Bulk Indexer: %s", err)
		}
	}

	if err := bi.Close(context.Background()); err != nil {
		log.Fatalf("Erro ao fechar Bulk Indexer: %s", err)
	}

	dur := time.Since(start)
	log.Printf("Ingestão concluída! %d documentos inseridos em %v", countSuccessful, dur)
}
