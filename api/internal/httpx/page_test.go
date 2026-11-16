package httpx

import (
	"net/url"
	"testing"
)

func TestNormalizePagination(t *testing.T) {
	cases := []struct {
		name                string
		page, limit         int
		wantPage, wantLimit int
	}{
		{"valores validos", 3, 50, 3, 50},
		{"zeros viram padrao", 0, 0, 1, DefaultPageSize},
		{"negativos viram padrao", -2, -5, 1, DefaultPageSize},
		{"limite no maximo", 1, MaxPageSize, 1, MaxPageSize},
		{"limite acima do maximo volta ao padrao", 1, MaxPageSize + 1, 1, DefaultPageSize},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			page, limit := NormalizePagination(c.page, c.limit)
			if page != c.wantPage || limit != c.wantLimit {
				t.Errorf("NormalizePagination(%d, %d) = %d, %d; esperado %d, %d",
					c.page, c.limit, page, limit, c.wantPage, c.wantLimit)
			}
		})
	}
}

func TestParsePagination(t *testing.T) {
	cases := []struct {
		query               string
		wantPage, wantLimit int
	}{
		{"", 1, DefaultPageSize},
		{"page=4&limit=10", 4, 10},
		{"page=abc&limit=xyz", 1, DefaultPageSize},
		{"page=0&limit=101", 1, DefaultPageSize},
	}
	for _, c := range cases {
		t.Run(c.query, func(t *testing.T) {
			values, err := url.ParseQuery(c.query)
			if err != nil {
				t.Fatal(err)
			}
			page, limit := ParsePagination(values)
			if page != c.wantPage || limit != c.wantLimit {
				t.Errorf("ParsePagination(%q) = %d, %d; esperado %d, %d", c.query, page, limit, c.wantPage, c.wantLimit)
			}
		})
	}
}
