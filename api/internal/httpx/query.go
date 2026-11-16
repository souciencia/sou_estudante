package httpx

import (
	"net/url"
	"strings"
)

// SplitCSV divide valores separados por vírgula e múltiplos parâmetros em um
// slice de strings, descartando espaços nas extremidades e entradas vazias.
func SplitCSV(values []string) []string {
	var result []string
	for _, v := range values {
		for _, part := range strings.Split(v, ",") {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				result = append(result, trimmed)
			}
		}
	}
	return result
}

// SetCSV grava items em values[key] como uma lista separada por vírgula, o
// inverso de SplitCSV. Lista vazia não cria a chave.
func SetCSV(values url.Values, key string, items []string) {
	if len(items) > 0 {
		values.Set(key, strings.Join(items, ","))
	}
}
