package ingest

import (
	"io"
	"sort"

	"api_estudante/internal/features/ies"
	"api_estudante/internal/ingest/bulk"
)

// DictionaryDocument é o documento do dicionário de IES: nome e sigla da
// instituição, permitindo o autocomplete por qualquer um dos dois.
type DictionaryDocument struct {
	NoIES string `json:"no_ies"`
	SgIES string `json:"sg_ies,omitempty"`
}

// DictionaryStream gera um documento de dicionário por IES, em ordem estável
// (por co_ies), pronto para indexação.
type DictionaryStream struct {
	docs []DictionaryDocument
	next int
}

// NewDictionaryStream ordena as IES por co_ies e devolve um stream de dicionário.
func NewDictionaryStream(docs map[string]ies.IES) *DictionaryStream {
	keys := make([]string, 0, len(docs))
	for coIES := range docs {
		keys = append(keys, coIES)
	}
	sort.Strings(keys)

	stream := &DictionaryStream{docs: make([]DictionaryDocument, 0, len(keys))}
	for _, coIES := range keys {
		doc := docs[coIES]
		stream.docs = append(stream.docs, DictionaryDocument{
			NoIES: doc.NoIES,
			SgIES: doc.SgIES,
		})
	}
	return stream
}

// Next devolve o próximo documento de dicionário, ou io.EOF ao final.
func (s *DictionaryStream) Next() (*bulk.Document, error) {
	if s.next >= len(s.docs) {
		return nil, io.EOF
	}
	doc := s.docs[s.next]
	s.next++
	return &bulk.Document{Body: doc}, nil
}

// Close satisfaz bulk.Stream; não há recurso a liberar.
func (s *DictionaryStream) Close() error { return nil }
