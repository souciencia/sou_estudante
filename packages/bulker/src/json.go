package main

import (
	"encoding/json"
	"io"
	"os"
)

// JSONReader lê registros (SourceRecord) de um arquivo JSON contendo um array.
type JSONReader struct {
	file    *os.File
	decoder *json.Decoder
	started bool
	done    bool
}

func NewJSONReader(filePath string) (*JSONReader, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}

	return &JSONReader{
		file:    file,
		decoder: json.NewDecoder(file),
	}, nil
}

// ReadRecord retorna o próximo SourceRecord do array.
// Retorna io.EOF quando não há mais registros.
func (r *JSONReader) ReadRecord() (*SourceRecord, error) {
	if r.done {
		return nil, io.EOF
	}

	if !r.started {
		r.started = true
		tok, err := r.decoder.Token()
		if err != nil {
			return nil, err
		}
		if delim, ok := tok.(json.Delim); !ok || delim != '[' {
			return nil, io.EOF
		}
	}

	for r.decoder.More() {
		var rec SourceRecord
		if err := r.decoder.Decode(&rec); err != nil {
			return nil, err
		}
		return &rec, nil
	}

	r.done = true
	return nil, io.EOF
}

func (r *JSONReader) Close() error {
	return r.file.Close()
}

func (r *JSONReader) IsEOF(err error) bool {
	return err == io.EOF
}
