package dictionary

import (
	"context"
	"fmt"
	"io"

	"github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/config"
	"api_estudante/internal/ingest/bulk"
)

// Spec descreve como construir um índice de dicionário a partir de um campo
// termo do índice de origem.
type Spec struct {
	SourceIndex string
	TargetIndex string
	SourceField string
	DocField    string
	Mapping     []byte
}

// Build recria o índice de dicionário a partir dos termos únicos do índice de
// origem. Retorna a quantidade de termos inseridos.
func Build(ctx context.Context, client *elasticsearch.Client, cfg *config.Config, spec Spec) (int, error) {
	if err := recreateIndex(ctx, client, spec); err != nil {
		return 0, err
	}

	terms, err := uniqueTerms(ctx, client, spec.SourceIndex, spec.SourceField)
	if err != nil {
		return 0, err
	}

	stream := &termStream{field: spec.DocField, terms: terms}
	inserted, err := bulk.Run(ctx, client, spec.TargetIndex, cfg, stream)
	if err != nil {
		return 0, fmt.Errorf("indexar termos do dicionário: %w", err)
	}

	if err := bulk.Refresh(ctx, client, spec.TargetIndex); err != nil {
		return 0, err
	}
	return int(inserted), nil
}

// termStream gera um documento de dicionário por termo único, no formato
// aceito pelo motor de ingestão.
type termStream struct {
	field string
	terms []string
	next  int
}

// Next retorna o próximo termo como documento pronto para indexação.
func (s *termStream) Next() (*bulk.Document, error) {
	if s.next >= len(s.terms) {
		return nil, io.EOF
	}
	term := s.terms[s.next]
	s.next++
	return &bulk.Document{Body: map[string]string{s.field: term}}, nil
}

// Close satisfaz bulk.Stream; não há recurso a liberar.
func (s *termStream) Close() error { return nil }
