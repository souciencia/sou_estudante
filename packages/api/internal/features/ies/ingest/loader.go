package ingest

import (
	"errors"
	"io"

	"api_estudante/internal/features/ies"
)

// Documents lê todos os registros do arquivo de origem e os indexa por co_ies.
func Documents(path string) (map[string]ies.IES, error) {
	reader, err := Open(path)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	docs := make(map[string]ies.IES)
	for {
		record, err := reader.Next()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return nil, err
		}

		doc := ToDocument(*record)
		if doc.CoIES != "" {
			docs[doc.CoIES] = doc
		}
	}
	return docs, nil
}
