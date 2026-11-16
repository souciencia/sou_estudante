// Package municipios agrega os municípios (código IBGE + nome) por UF a partir
// dos índices de origem (cursos e ies), produzindo o stream que alimenta o
// índice derivado "estados-municipios".
package municipios

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"sort"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/ingest/bulk"
)

const (
	aggregationName = "municipios"
	pageSize        = 1000
)

// Campos keyword de localização usados na agregação composite.
const (
	ufField          = "localizacao.sg_uf"
	municipioField   = "localizacao.co_municipio"
	nomeMunicipioFld = "localizacao.no_municipio"
)

// Municipio é um par código IBGE/nome de município dentro de um estado.
type Municipio struct {
	Codigo string `json:"codigo"`
	Nome   string `json:"nome"`
}

// Document é o documento do índice estados-municipios: um estado e a lista
// ordenada dos seus municípios.
type Document struct {
	UF         string      `json:"uf"`
	Municipios []Municipio `json:"municipios"`
}

// Stream gera um documento por UF, em ordem alfabética de sigla.
type Stream struct {
	docs []Document
	next int
}

// Next devolve o próximo documento por UF, ou io.EOF ao final.
func (s *Stream) Next() (*bulk.Document, error) {
	if s.next >= len(s.docs) {
		return nil, io.EOF
	}
	doc := s.docs[s.next]
	s.next++
	return &bulk.Document{ID: doc.UF, Body: doc}, nil
}

// Close satisfaz bulk.Stream; não há recurso a liberar.
func (s *Stream) Close() error { return nil }

// NewStream agrega os municípios por UF a partir dos índices informados (ex.:
// cursos-latest e ies-latest), devolvendo um stream pronto para indexação com
// UFs e municípios em ordem alfabética.
func NewStream(ctx context.Context, client *elasticsearch.Client, indices []string) (*Stream, error) {
	byUF := make(map[string]map[string]string) // uf -> codigo -> nome

	for _, index := range indices {
		pairs, err := collect(ctx, client, index)
		if err != nil {
			return nil, err
		}
		for _, p := range pairs {
			if p.codigo == "" || p.nome == "" {
				continue
			}
			if byUF[p.uf] == nil {
				byUF[p.uf] = make(map[string]string)
			}
			if _, exists := byUF[p.uf][p.codigo]; !exists {
				byUF[p.uf][p.codigo] = p.nome
			}
		}
	}

	ufs := make([]string, 0, len(byUF))
	for uf := range byUF {
		ufs = append(ufs, uf)
	}
	sort.Strings(ufs)

	docs := make([]Document, 0, len(ufs))
	for _, uf := range ufs {
		docs = append(docs, Document{UF: uf, Municipios: sortedMunicipios(byUF[uf])})
	}

	return &Stream{docs: docs}, nil
}

// sortedMunicipios ordena os municípios por nome (ignorando caixa) de forma
// estável, mantendo o código ao lado do nome correspondente.
func sortedMunicipios(byCodigo map[string]string) []Municipio {
	municipios := make([]Municipio, 0, len(byCodigo))
	for codigo, nome := range byCodigo {
		municipios = append(municipios, Municipio{Codigo: codigo, Nome: nome})
	}
	sort.SliceStable(municipios, func(i, j int) bool {
		return strings.ToLower(municipios[i].Nome) < strings.ToLower(municipios[j].Nome)
	})
	return municipios
}

type pair struct {
	uf     string
	codigo string
	nome   string
}

type compositeKey struct {
	UF     string `json:"uf"`
	Codigo string `json:"codigo"`
	Nome   string `json:"nome"`
}

type compositeResponse struct {
	Aggregations struct {
		Municipios struct {
			AfterKey map[string]any `json:"after_key"`
			Buckets  []struct {
				Key compositeKey `json:"key"`
			} `json:"buckets"`
		} `json:"municipios"`
	} `json:"aggregations"`
}

// collect extrai os pares (uf, código, nome) distintos do índice, paginando
// pela composite aggregation até esgotar os buckets.
func collect(ctx context.Context, client *elasticsearch.Client, index string) ([]pair, error) {
	var pairs []pair
	var afterKey map[string]any

	for {
		query, err := aggregateQuery(afterKey)
		if err != nil {
			return nil, fmt.Errorf("montar agregação de municípios: %w", err)
		}

		body, err := search(ctx, client, index, query)
		if err != nil {
			return nil, err
		}

		var parsed compositeResponse
		if err := json.Unmarshal(body, &parsed); err != nil {
			return nil, fmt.Errorf("decodificar agregação de municípios: %w", err)
		}

		buckets := parsed.Aggregations.Municipios.Buckets
		for _, bucket := range buckets {
			pairs = append(pairs, pair{
				uf:     strings.TrimSpace(bucket.Key.UF),
				codigo: strings.TrimSpace(bucket.Key.Codigo),
				nome:   strings.TrimSpace(bucket.Key.Nome),
			})
		}

		afterKey = parsed.Aggregations.Municipios.AfterKey
		if len(buckets) == 0 || len(afterKey) == 0 {
			break
		}
	}

	return pairs, nil
}

func aggregateQuery(afterKey map[string]any) ([]byte, error) {
	composite := map[string]any{
		"size": pageSize,
		"sources": []map[string]any{
			{"uf": map[string]any{"terms": map[string]any{"field": ufField}}},
			{"codigo": map[string]any{"terms": map[string]any{"field": municipioField}}},
			{"nome": map[string]any{"terms": map[string]any{"field": nomeMunicipioFld}}},
		},
	}
	if len(afterKey) > 0 {
		composite["after"] = afterKey
	}

	return json.Marshal(map[string]any{
		"size": 0,
		"aggs": map[string]any{
			aggregationName: map[string]any{"composite": composite},
		},
	})
}

func search(ctx context.Context, client *elasticsearch.Client, index string, query []byte) ([]byte, error) {
	res, err := client.Search(
		client.Search.WithContext(ctx),
		client.Search.WithIndex(index),
		client.Search.WithBody(bytes.NewReader(query)),
	)
	if err != nil {
		return nil, fmt.Errorf("buscar municípios únicos: %w", err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("ler resposta da busca de municípios: %w", err)
	}
	if res.IsError() {
		return nil, fmt.Errorf("erro do elasticsearch na busca de municípios: %s", string(body))
	}
	return body, nil
}
