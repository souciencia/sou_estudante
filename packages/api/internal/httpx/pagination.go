package httpx

import (
	"fmt"
	"net/url"
	"strconv"
)

// PaginationLinks contém URLs HATEOAS para navegação de páginas.
type PaginationLinks struct {
	Self  string  `json:"self"`
	First string  `json:"first"`
	Prev  *string `json:"prev,omitempty"`
	Next  *string `json:"next,omitempty"`
	Last  string  `json:"last"`
}

// BuildPaginationLinks monta os links HATEOAS preservando os filtros já
// presentes em base. base deve conter os parâmetros de busca e filtro; page e
// limit são acrescentados (ou sobrescritos) em cada link.
func BuildPaginationLinks(basePath string, base url.Values, page, limit, total int) PaginationLinks {
	// Normaliza entradas inválidas: limit <= 0 causaria divisão por zero e
	// page < 1 geraria links sem sentido. Os callers já fazem esse clamp, mas
	// esta função é exportada e não deve confiar nisso.
	if limit < 1 {
		limit = DefaultPageSize
	}
	if page < 1 {
		page = 1
	}

	lastPage := (total + limit - 1) / limit
	if lastPage < 1 {
		lastPage = 1
	}

	buildURL := func(p int) string {
		values := cloneValues(base)
		values.Set("page", strconv.Itoa(p))
		values.Set("limit", strconv.Itoa(limit))
		return fmt.Sprintf("%s?%s", basePath, values.Encode())
	}

	links := PaginationLinks{
		Self:  buildURL(page),
		First: buildURL(1),
		Last:  buildURL(lastPage),
	}

	if page > 1 {
		prev := buildURL(page - 1)
		links.Prev = &prev
	}
	if page < lastPage {
		next := buildURL(page + 1)
		links.Next = &next
	}

	return links
}

func cloneValues(values url.Values) url.Values {
	clone := make(url.Values, len(values))
	for key, vals := range values {
		clone[key] = append([]string(nil), vals...)
	}
	return clone
}
