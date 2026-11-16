package municipios

import (
	"context"
	"fmt"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/elasticsearch"
)

// maxUFs é o limite de documentos lidos do índice (27 UFs).
const maxUFs = 30

// Repository define o contrato de leitura dos municípios por UF.
type Repository interface {
	Listar(ctx context.Context) (Response, error)
}

// ElasticsearchRepository implementa Repository sobre o índice estados-municipios.
type ElasticsearchRepository struct {
	client *es.Client
	index  string
}

// NewElasticsearchRepository cria o repository sobre o índice informado
// (config.MunicipiosIndexName).
func NewElasticsearchRepository(client *es.Client, index string) Repository {
	return &ElasticsearchRepository{client: client, index: index}
}

// Listar devolve todos os estados com seus municípios, indexados por sigla de UF.
func (r *ElasticsearchRepository) Listar(ctx context.Context) (Response, error) {
	esQuery := map[string]any{
		"size":  maxUFs,
		"query": map[string]any{"match_all": map[string]any{}},
	}

	resp, err := elasticsearch.ExecuteSearch[Estado](ctx, r.client, r.index, esQuery)
	if err != nil {
		return nil, fmt.Errorf("erro ao consultar municípios no elasticsearch: %w", err)
	}

	result := make(Response, len(resp.Hits))
	for _, hit := range resp.Hits {
		result[hit.UF] = hit.Municipios
	}
	return result, nil
}
