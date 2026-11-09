package elasticsearch

import (
	"strings"

	"api_estudante/internal/domain"
)

// Builders da query DSL usados pelos repositórios de leitura. Cada função
// devolve um fragmento pronto para compor a busca; os campos e as regras de
// cada feature continuam nos próprios repositórios.

// TermsFilter monta a cláusula "terms" de um campo keyword.
func TermsFilter(field string, values []string) map[string]any {
	return map[string]any{
		"terms": map[string]any{field: values},
	}
}

// UpperTermsFilter é um TermsFilter com os valores em maiúsculas, para campos
// gravados assim (ex.: siglas de UF). Não altera o slice recebido.
func UpperTermsFilter(field string, values []string) map[string]any {
	upper := make([]string, len(values))
	for i, value := range values {
		upper[i] = strings.ToUpper(value)
	}
	return TermsFilter(field, upper)
}

// AnyOf monta um bool query que exige ao menos uma das cláusulas.
func AnyOf(clauses []map[string]any) map[string]any {
	return map[string]any{
		"bool": map[string]any{
			"should":               clauses,
			"minimum_should_match": 1,
		},
	}
}

// TermsAgg monta uma agregação de termos para um campo keyword.
func TermsAgg(field string, size int) map[string]any {
	return map[string]any{
		"terms": map[string]any{
			"field": field,
			"size":  size,
		},
	}
}

// FilteredAgg envolve uma agregação interna num filtro bool, para a faceta
// refletir os demais filtros da busca (preservando a própria multi-seleção). O
// bucket interno é nomeado "termos" e é lido por ParseFilteredBuckets.
func FilteredAgg(filter []map[string]any, inner map[string]any) map[string]any {
	return map[string]any{
		"filter": map[string]any{
			"bool": map[string]any{"filter": filter},
		},
		"aggs": map[string]any{
			"termos": inner,
		},
	}
}

// FiltersAgg monta uma agregação "filters" com um bucket por filtro nomeado.
func FiltersAgg(named map[string]any) map[string]any {
	return map[string]any{
		"filters": map[string]any{
			"filters": named,
		},
	}
}

// CategoriaFilter monta o filtro de categoria administrativa para o campo da
// IES informado, traduzindo o rótulo da UI (domain.CategoriaTerms). Devolve nil
// para um rótulo desconhecido.
func CategoriaFilter(field, categoria string) map[string]any {
	terms := domain.CategoriaTerms(categoria)
	if len(terms) == 0 {
		return nil
	}
	return TermsFilter(field, terms)
}

// CategoriaAnyOf combina, com "ou", os filtros das categorias conhecidas.
// Devolve nil quando nenhuma das categorias é reconhecida.
func CategoriaAnyOf(field string, categorias []string) map[string]any {
	var should []map[string]any
	for _, categoria := range categorias {
		if clause := CategoriaFilter(field, categoria); clause != nil {
			should = append(should, clause)
		}
	}
	if len(should) == 0 {
		return nil
	}
	return AnyOf(should)
}

// CategoriasAgg monta a agregação com um bucket por categoria administrativa
// sobre o campo informado.
func CategoriasAgg(field string) map[string]any {
	return FiltersAgg(map[string]any{
		"Privada Com Fins Lucrativos": CategoriaFilter(field, "privada com fins lucrativos"),
		"Privada Sem Fins Lucrativos": CategoriaFilter(field, "privada sem fins lucrativos"),
		"Pública Federal":             CategoriaFilter(field, "pública federal"),
		"Pública Estadual":            CategoriaFilter(field, "pública estadual"),
		"Pública Municipal":           CategoriaFilter(field, "pública municipal"),
	})
}

// SearchBody monta o corpo completo de uma busca paginada: bool query com a
// parte textual em must, mais paginação, ordenação e agregações. Os filtros
// entram como post_filter: os hits e o total respeitam o filtro, mas as
// agregações refletem o resultado sem ele, preservando a multi-seleção (faceted
// search) — depois de escolher um valor, os demais continuam mostrando sua
// contagem e seguem selecionáveis. page começa em 1.
func SearchBody(
	must map[string]any,
	filters []map[string]any,
	sort []map[string]any,
	aggs map[string]any,
	page, limit int,
) map[string]any {
	body := map[string]any{
		"query": map[string]any{"bool": map[string]any{"must": must}},
		"size":  limit,
		"from":  (page - 1) * limit,
		"sort":  sort,
		"aggs":  aggs,
	}

	if len(filters) > 0 {
		body["post_filter"] = map[string]any{
			"bool": map[string]any{"filter": filters},
		}
	}

	return body
}
