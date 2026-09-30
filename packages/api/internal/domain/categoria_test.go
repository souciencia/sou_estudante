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
		{"privada", "privada", []string{"Privada com fins lucrativos", "Privada sem fins lucrativos"}},
		{"federal", "federal", []string{"Pública Federal"}},
		{"estadual", "estadual", []string{"Pública Estadual"}},
		{"municipal", "municipal", []string{"Pública Municipal"}},
		{"case-insensitive", "PRIVADA", []string{"Privada com fins lucrativos", "Privada sem fins lucrativos"}},
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
