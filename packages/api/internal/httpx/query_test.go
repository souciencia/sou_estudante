package httpx

import (
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
