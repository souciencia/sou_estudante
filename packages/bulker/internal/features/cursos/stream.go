package cursos

import (
	"strconv"

	"bulker/internal/ingest"
)

// Stream adapta a leitura e o mapeamento dos cursos ao motor de ingestão.
type Stream struct {
	reader *Reader
	lookup map[string]InstituicaoInfo
}

// NewStream abre o arquivo de origem de cursos para ingestão. O lookup associa
// o co_ies aos atributos da IES usados para enriquecer cada documento.
func NewStream(path string, lookup map[string]InstituicaoInfo) (*Stream, error) {
	reader, err := Open(path)
	if err != nil {
		return nil, err
	}
	return &Stream{reader: reader, lookup: lookup}, nil
}

// Next retorna o próximo curso pronto para indexação.
func (s *Stream) Next() (*ingest.Document, error) {
	record, err := s.reader.Next()
	if err != nil {
		return nil, err
	}

	info := s.lookup[intToStr(record.IESCoIES)]
	doc := ToDocument(*record, info)
	id := ""
	if doc.Sequencial != nil {
		id = strconv.FormatInt(*doc.Sequencial, 10)
	}
	return &ingest.Document{ID: id, Body: doc}, nil
}

// Close fecha o arquivo de origem.
func (s *Stream) Close() error {
	return s.reader.Close()
}
