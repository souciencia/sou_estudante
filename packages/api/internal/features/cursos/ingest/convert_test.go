package ingest

import "testing"

func TestIntToStr(t *testing.T) {
	casos := []struct {
		nome  string
		valor *int
		want  string
	}{
		{"nil", nil, ""},
		{"zero", intPtr(0), "0"},
		{"positivo", intPtr(42), "42"},
		{"negativo", intPtr(-7), "-7"},
	}

	for _, caso := range casos {
		t.Run(caso.nome, func(t *testing.T) {
			if got := intToStr(caso.valor); got != caso.want {
				t.Errorf("intToStr(%v) = %q, esperado %q", caso.valor, got, caso.want)
			}
		})
	}
}

func TestIntToBool(t *testing.T) {
	casos := []struct {
		nome  string
		valor *int
		want  bool
	}{
		{"nil", nil, false},
		{"zero", intPtr(0), false},
		{"um", intPtr(1), true},
		{"dois", intPtr(2), false},
		{"negativo", intPtr(-1), false},
	}

	for _, caso := range casos {
		t.Run(caso.nome, func(t *testing.T) {
			if got := intToBool(caso.valor); got != caso.want {
				t.Errorf("intToBool(%v) = %v, esperado %v", caso.valor, got, caso.want)
			}
		})
	}
}
