package ies

import (
	"encoding/json"
	"errors"
	"io"
	"os"
)

// Reader lê, de forma incremental, os registros de um arquivo NDJSON no
// formato bulk do Elasticsearch: uma linha de metadata (ação "index") seguida
// de uma linha de source.
type Reader struct {
	file    *os.File
	decoder *json.Decoder
	done    bool
}

// Open abre o arquivo NDJSON de origem para leitura incremental.
func Open(filePath string) (*Reader, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	return &Reader{file: file, decoder: json.NewDecoder(file)}, nil
}

// Next retorna o próximo registro de origem, ignorando as linhas de metadata.
// Retorna io.EOF quando não há mais registros.
func (r *Reader) Next() (*SourceRecord, error) {
	if r.done {
		return nil, io.EOF
	}

	for {
		var raw json.RawMessage
		if err := r.decoder.Decode(&raw); err != nil {
			if errors.Is(err, io.EOF) {
				r.done = true
			}
			return nil, err
		}
		if isMetadata(raw) {
			continue
		}

		var record SourceRecord
		if err := json.Unmarshal(raw, &record); err != nil {
			return nil, err
		}
		return &record, nil
	}
}

// Close fecha o arquivo de origem.
func (r *Reader) Close() error {
	return r.file.Close()
}

// isMetadata indica se a linha decodificada é um cabeçalho de ação do bulk.
func isMetadata(raw []byte) bool {
	var meta map[string]json.RawMessage
	if err := json.Unmarshal(raw, &meta); err != nil {
		return false
	}
	_, ok := meta["index"]
	return ok
}
