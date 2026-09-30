package httpx

import (
	"net/url"
	"testing"
)

func parseURL(t *testing.T, raw string) *url.URL {
	t.Helper()
	parsed, err := url.Parse(raw)
	if err != nil {
		t.Fatalf("link inválido %q: %v", raw, err)
	}
	return parsed
}

func TestBuildPaginationLinksNoMeioDaLista(t *testing.T) {
	base := url.Values{}
	base.Set("q", "medicina")
	base.Set("uf", "SP,RJ")

	links := BuildPaginationLinks("/cursos", base, 2, 10, 25)

	self := parseURL(t, links.Self)
	if self.Path != "/cursos" {
		t.Errorf("self path = %q, esperado /cursos", self.Path)
	}
	if got := self.Query().Get("page"); got != "2" {
		t.Errorf("self page = %q, esperado 2", got)
	}
	if got := self.Query().Get("uf"); got != "SP,RJ" {
		t.Errorf("self uf = %q, esperado SP,RJ", got)
	}

	if got := parseURL(t, links.First).Query().Get("page"); got != "1" {
		t.Errorf("first page = %q, esperado 1", got)
	}
	if got := parseURL(t, links.Last).Query().Get("page"); got != "3" {
		t.Errorf("last page = %q, esperado 3", got)
	}
	if links.Prev == nil || parseURL(t, *links.Prev).Query().Get("page") != "1" {
		t.Errorf("prev incorreto: %v", links.Prev)
	}
	if links.Next == nil || parseURL(t, *links.Next).Query().Get("page") != "3" {
		t.Errorf("next incorreto: %v", links.Next)
	}
}

func TestBuildPaginationLinksPrimeiraPagina(t *testing.T) {
	links := BuildPaginationLinks("/ies", url.Values{}, 1, 20, 100)

	if links.Prev != nil {
		t.Errorf("prev deveria ser nil na primeira página, obtido %v", *links.Prev)
	}
	if links.Next == nil {
		t.Fatal("next deveria existir")
	}
	if got := parseURL(t, *links.Next).Query().Get("page"); got != "2" {
		t.Errorf("next page = %q, esperado 2", got)
	}
}

func TestBuildPaginationLinksUltimaPagina(t *testing.T) {
	links := BuildPaginationLinks("/ies", url.Values{}, 3, 10, 25)

	if links.Prev == nil {
		t.Fatal("prev deveria existir na última página")
	}
	if links.Next != nil {
		t.Errorf("next deveria ser nil na última página, obtido %v", *links.Next)
	}
}

func TestBuildPaginationLinksResultadoVazio(t *testing.T) {
	links := BuildPaginationLinks("/ies", url.Values{}, 1, 20, 0)

	if got := parseURL(t, links.Last).Query().Get("page"); got != "1" {
		t.Errorf("last page = %q, esperado 1", got)
	}
	if links.Prev != nil || links.Next != nil {
		t.Errorf("sem prev/next esperados: prev=%v next=%v", links.Prev, links.Next)
	}
}

func TestBuildPaginationLinksLimitInvalidoNaoDividePorZero(t *testing.T) {
	for _, limit := range []int{0, -5} {
		links := BuildPaginationLinks("/cursos", url.Values{}, 1, limit, 25)

		if got := parseURL(t, links.Last).Query().Get("page"); got != "2" {
			t.Errorf("limit=%d: last page = %q, esperado 2", limit, got)
		}
		if got := parseURL(t, links.Self).Query().Get("limit"); got != "20" {
			t.Errorf("limit=%d: limit do link = %q, esperado 20", limit, got)
		}
	}
}

func TestBuildPaginationLinksPaginaMenorQueUmViraPrimeira(t *testing.T) {
	links := BuildPaginationLinks("/cursos", url.Values{}, 0, 10, 30)

	if got := parseURL(t, links.Self).Query().Get("page"); got != "1" {
		t.Errorf("self page = %q, esperado 1", got)
	}
	if links.Prev != nil {
		t.Errorf("prev deveria ser nil, obtido %v", *links.Prev)
	}
}

func TestBuildPaginationLinksPaginaAcimaDoUltimo(t *testing.T) {
	links := BuildPaginationLinks("/cursos", url.Values{}, 5, 10, 25)

	if got := parseURL(t, links.Last).Query().Get("page"); got != "3" {
		t.Errorf("last page = %q, esperado 3", got)
	}
	if links.Prev == nil || parseURL(t, *links.Prev).Query().Get("page") != "4" {
		t.Errorf("prev incorreto: %v", links.Prev)
	}
	if links.Next != nil {
		t.Errorf("next deveria ser nil quando page > lastPage, obtido %v", *links.Next)
	}
}

func TestBuildPaginationLinksNaoMutaBase(t *testing.T) {
	base := url.Values{}
	base.Set("q", "direito")

	BuildPaginationLinks("/cursos", base, 2, 10, 30)

	if base.Get("page") != "" || base.Get("limit") != "" {
		t.Errorf("base foi mutada: %v", base)
	}
}
