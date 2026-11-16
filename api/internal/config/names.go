package config

import "time"

// Convenção de nomes dos índices do Elasticsearch. Os índices concretos levam a
// data de ingestão (<nome>-<AAAA-MM-DD>) e um alias "ponteiro" (<nome>-latest)
// aponta sempre para o índice mais recente.

const (
	latestSuffix    = "-latest"
	indexDateLayout = "2006-01-02"
)

// LatestIndexName devolve o nome do alias "ponteiro" de um índice base
// (ex.: "cursos" -> "cursos-latest").
func LatestIndexName(base string) string {
	return base + latestSuffix
}

// DatedIndexName devolve o nome do índice concreto de um índice base para a
// data informada no formato AAAA-MM-DD (ex.: "cursos" -> "cursos-2026-10-20").
func DatedIndexName(base, date string) string {
	return base + "-" + date
}

// IndexDate devolve a data de um instante no formato AAAA-MM-DD (UTC), usada no
// sufixo dos índices concretos criados pela ingestão.
func IndexDate(now time.Time) string {
	return now.UTC().Format(indexDateLayout)
}
