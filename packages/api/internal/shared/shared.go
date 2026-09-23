// Package shared reúne utilitários reaproveitados por mais de um módulo da API.
package shared

import "strings"

// CategoriaTerms traduz o rótulo de categoria exibido na UI para os valores de
// categoria_administrativa indexados a partir dos dados da IES.
func CategoriaTerms(categoria string) []string {
	switch strings.ToLower(categoria) {
	case "privada":
		return []string{"Privada com fins lucrativos", "Privada sem fins lucrativos"}
	case "federal":
		return []string{"Pública Federal"}
	case "estadual":
		return []string{"Pública Estadual"}
	case "municipal":
		return []string{"Pública Municipal"}
	default:
		return nil
	}
}

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
