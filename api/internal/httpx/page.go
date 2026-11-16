package httpx

import (
	"net/url"
	"strconv"
)

// NormalizePagination aplica os padrões e limites de paginação: page < 1 vira
// 1; limit fora de 1..MaxPageSize volta a DefaultPageSize (não é cortado).
func NormalizePagination(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > MaxPageSize {
		limit = DefaultPageSize
	}
	return page, limit
}

// ParsePagination lê "page" e "limit" da query e os normaliza. Valores
// ausentes ou não numéricos usam os padrões.
func ParsePagination(values url.Values) (page, limit int) {
	page, _ = strconv.Atoi(values.Get("page"))
	limit, _ = strconv.Atoi(values.Get("limit"))
	return NormalizePagination(page, limit)
}
