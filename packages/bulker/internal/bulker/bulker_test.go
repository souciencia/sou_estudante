package bulker

import "testing"

func TestNeedsIndexing(t *testing.T) {
	cases := []struct {
		name   string
		exists bool
		count  int64
		want   bool
	}{
		{"índice ausente", false, 0, true},
		{"índice vazio", true, 0, true},
		{"índice populado", true, 42, false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := needsIndexing(tc.exists, tc.count); got != tc.want {
				t.Errorf("needsIndexing(%v, %d) = %v, esperado %v", tc.exists, tc.count, got, tc.want)
			}
		})
	}
}
