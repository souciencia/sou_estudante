package httpx

import (
	"net/url"
	"reflect"
	"testing"
)

func TestSplitCSV(t *testing.T) {
	cases := []struct {
		name  string
		input []string
		want  []string
	}{
		{"sem entrada", nil, nil},
		{"um valor", []string{"SP"}, []string{"SP"}},
		{"multiplos por virgula", []string{"SP,RJ"}, []string{"SP", "RJ"}},
		{"espacos nas extremidades", []string{" SP , RJ "}, []string{"SP", "RJ"}},
		{"varios parametros", []string{"SP", "RJ"}, []string{"SP", "RJ"}},
		{"entradas vazias descartadas", []string{"SP,,RJ", ""}, []string{"SP", "RJ"}},
		{"todas as entradas vazias", []string{"", ",", " "}, nil},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := SplitCSV(tc.input); !reflect.DeepEqual(got, tc.want) {
				t.Errorf("SplitCSV(%v) = %v, esperado %v", tc.input, got, tc.want)
			}
		})
	}
}

func TestSetCSVGravaOsValoresSeparadosPorVirgula(t *testing.T) {
	values := url.Values{}

	SetCSV(values, "uf", []string{"SP", "RJ"})

	if got := values.Get("uf"); got != "SP,RJ" {
		t.Errorf("uf = %q, esperado %q", got, "SP,RJ")
	}
}

func TestSetCSVIgnoraListaVazia(t *testing.T) {
	values := url.Values{}

	SetCSV(values, "uf", nil)
	SetCSV(values, "turno", []string{})

	if len(values) != 0 {
		t.Errorf("nenhuma chave deveria ser criada, obtido %v", values)
	}
}

func TestSetCSVEhInversoDeSplitCSV(t *testing.T) {
	values := url.Values{}
	SetCSV(values, "grau", []string{"Bacharelado", "Licenciatura"})

	if got := SplitCSV(values["grau"]); !reflect.DeepEqual(got, []string{"Bacharelado", "Licenciatura"}) {
		t.Errorf("ida e volta falhou: %v", got)
	}
}
