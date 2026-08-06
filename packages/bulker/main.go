package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"sync/atomic"
	"time"

	"github.com/elastic/go-elasticsearch/v8/esutil"
)

func main() {
	cfg := LoadConfig()

	log.Printf("Iniciando bulker com arquivo %s no índice '%s'...", cfg.CSVFilePath, cfg.IndexName)

	es, err := NewElasticsearchClient(cfg)
	if err != nil {
		log.Fatalf("Erro ao criar cliente ES: %s", err)
	}

	bi, err := NewBulkIndexer(es, cfg)
	if err != nil {
		log.Fatalf("Erro ao criar Bulk Indexer: %s", err)
	}

	csvReader, err := NewCSVReader(cfg.CSVFilePath)
	if err != nil {
		log.Fatalf("Erro ao abrir arquivo CSV: %s", err)
	}
	defer csvReader.Close()

	var countSuccessful uint64
	start := time.Now()

	log.Printf("Processando registros do CSV...")

	for {
		record, err := csvReader.ReadRecord()
		if csvReader.IsEOF(err) {
			break
		}
		if err != nil {
			log.Printf("Erro ao ler linha: %v", err)
			continue
		}

		doc := mapRecordToDocument(record, csvReader.GetHeaderMap())
		docBytes, err := json.Marshal(doc)
		if err != nil {
			log.Printf("Erro ao serializar JSON: %v", err)
			continue
		}

		docID := getVal(record, csvReader.GetHeaderMap(), "sequencial")

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