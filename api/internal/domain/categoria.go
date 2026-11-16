// Package domain reúne vocabulário de domínio compartilhado entre features.
package domain

import "strings"

// CategoriaTerms traduz o rótulo de categoria exibido na UI para o valor de
// categoria_administrativa indexado a partir dos dados da IES. Os valores
// refletem a normalização textcase.Title aplicada na ingestão.
func CategoriaTerms(categoria string) []string {
	switch strings.ToLower(categoria) {
	case "pública federal":
		return []string{"Pública Federal"}
	case "pública estadual":
		return []string{"Pública Estadual"}
	case "pública municipal":
		return []string{"Pública Municipal"}
	case "privada sem fins lucrativos":
		return []string{"Privada Sem Fins Lucrativos"}
	case "privada com fins lucrativos":
		return []string{"Privada Com Fins Lucrativos"}
	default:
		return nil
	}
}
