package textcase

import "testing"

func TestTitle(t *testing.T) {
	casos := []struct {
		nome     string
		entrada  string
		esperado string
	}{
		{"palavra unica", "DIREITO", "Direito"},
		{"acentuada", "EDUCAÇÃO", "Educação"},
		{"duas palavras", "MATO GROSSO", "Mato Grosso"},
		{"conectivo no meio", "MATO GROSSO DO SUL", "Mato Grosso do Sul"},
		{"conectivo no inicio", "DE ALGO", "De Algo"},
		{"conectivo e", "PONTE E VIADUTO", "Ponte e Viaduto"},
		{"hifen", "CENTRO-OESTE", "Centro-Oeste"},
		{"hifen capitaliza segmentos", "MATA-DE-SÃO-JOÃO", "Mata-De-São-João"},
		{"municipio acentuado", "CUIABÁ", "Cuiabá"},
		{"ja normalizada", "São Paulo", "São Paulo"},
		{"vazia", "", ""},
		{"espacos multiplos", "MATA  GROSSO", "Mata  Grosso"},
	}

	for _, caso := range casos {
		t.Run(caso.nome, func(t *testing.T) {
			if got := Title(caso.entrada); got != caso.esperado {
				t.Errorf("Title(%q) = %q, esperado %q", caso.entrada, got, caso.esperado)
			}
		})
	}
}
