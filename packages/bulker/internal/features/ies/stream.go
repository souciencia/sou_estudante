package ies

import "bulker/internal/ingest"

// Stream adapta a leitura e o mapeamento das IES ao motor de ingestão.
type Stream struct {
	reader *Reader
}

// NewStream abre o arquivo de origem das IES para ingestão.
func NewStream(path string) (*Stream, error) {
	reader, err := Open(path)
	if err != nil {
		return nil, err
	}
	return &Stream{reader: reader}, nil
}

// Next retorna a próxima IES pronta para indexação.
func (s *Stream) Next() (*ingest.Document, error) {
	record, err := s.reader.Next()
	if err != nil {
		return nil, err
	}

	doc := ToDocument(*record)
	return &ingest.Document{ID: doc.CoIES, Body: doc}, nil
}

// Close fecha o arquivo de origem.
func (s *Stream) Close() error {
	return s.reader.Close()
}
