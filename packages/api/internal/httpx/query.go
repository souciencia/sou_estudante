package httpx

import "strings"

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
