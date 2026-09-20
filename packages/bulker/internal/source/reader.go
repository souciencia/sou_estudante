package source

import (
	"encoding/json"
	"io"
	"os"

	"bulker/internal/model"
)

// Reader lê, de forma incremental, os registros de um arquivo JSON contendo um array.
type Reader struct {
	file    *os.File
	decoder *json.Decoder
	started bool
	done    bool
}

// Open abre o arquivo JSON de origem para leitura incremental.
func Open(filePath string) (*Reader, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	return &Reader{file: file, decoder: json.NewDecoder(file)}, nil
}

// Next retorna o próximo registro do array.
// Retorna io.EOF (ver IsEOF) quando não há mais registros.
func (r *Reader) Next() (*model.SourceRecord, error) {
	if r.done {
		return nil, io.EOF
	}

	if !r.started {
		r.started = true
		token, err := r.decoder.Token()
		if err != nil {
			return nil, err
		}
		if delim, ok := token.(json.Delim); !ok || delim != '[' {
			return nil, io.EOF
		}
	}

	if !r.decoder.More() {
		r.done = true
		return nil, io.EOF
	}

	var record model.SourceRecord
	if err := r.decoder.Decode(&record); err != nil {
		return nil, err
	}
	return &record, nil
}

// Close fecha o arquivo de origem.
func (r *Reader) Close() error {
	return r.file.Close()
}

// IsEOF informa se o erro indica o fim dos registros.
func IsEOF(err error) bool {
	return err == io.EOF
}
