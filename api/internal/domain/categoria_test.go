package domain

import (
	"reflect"
	"testing"
)

func TestCategoriaTerms(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  []string
	}{
		{"pública federal", "Pública Federal", []string{"Pública Federal"}},
		{"pública estadual", "Pública Estadual", []string{"Pública Estadual"}},
		{"pública municipal", "Pública Municipal", []string{"Pública Municipal"}},
		{"privada sem fins lucrativos", "Privada Sem Fins Lucrativos", []string{"Privada Sem Fins Lucrativos"}},
		{"privada com fins lucrativos", "Privada Com Fins Lucrativos", []string{"Privada Com Fins Lucrativos"}},
		{"case-insensitive", "PÚBLICA FEDERAL", []string{"Pública Federal"}},
		{"privada sem especificar fins", "privada", nil},
		{"desconhecida", "especial", nil},
		{"vazia", "", nil},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := CategoriaTerms(tc.input); !reflect.DeepEqual(got, tc.want) {
				t.Errorf("CategoriaTerms(%q) = %v, esperado %v", tc.input, got, tc.want)
			}
		})
	}
}
