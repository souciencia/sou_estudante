package config

import (
	"testing"
	"time"
)

func TestLatestIndexNameAcrescentaSufixoLatest(t *testing.T) {
	casos := map[string]string{
		"cursos":            "cursos-latest",
		"ies":               "ies-latest",
		"dicionario-cursos": "dicionario-cursos-latest",
		"dicionario-ies":    "dicionario-ies-latest",
	}
	for base, want := range casos {
		if got := LatestIndexName(base); got != want {
			t.Errorf("LatestIndexName(%q) = %q, esperado %q", base, got, want)
		}
	}
}

func TestDatedIndexNameAcrescentaSufixoComData(t *testing.T) {
	if got := DatedIndexName("cursos", "2026-10-20"); got != "cursos-2026-10-20" {
		t.Errorf("DatedIndexName = %q, esperado cursos-2026-10-20", got)
	}
	if got := DatedIndexName("dicionario-cursos", "2026-10-20"); got != "dicionario-cursos-2026-10-20" {
		t.Errorf("DatedIndexName = %q, esperado dicionario-cursos-2026-10-20", got)
	}
}

func TestIndexDateUsaUTCNoFormatoAAAAMMDD(t *testing.T) {
	// Um instante às 23h30 em UTC-3 já é o dia seguinte em UTC: a data do
	// índice deve seguir o relógio UTC para ser estável entre fusos.
	now := time.Date(2026, 10, 20, 23, 30, 0, 0, time.FixedZone("BRT", -3*60*60))
	if got := IndexDate(now); got != "2026-10-21" {
		t.Errorf("IndexDate = %q, esperado 2026-10-21", got)
	}
}
