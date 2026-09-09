package main

import (
	"reflect"
	"sort"
	"testing"
)

func TestDeduplicateCursos(t *testing.T) {
	input := []string{
		"Administração",
		"Direito",
		"Administração",
		"Medicina",
		"Direito",
		"",
		"   ",
		"Ciência da Computação",
	}

	expected := []string{
		"Administração",
		"Ciência da Computação",
		"Direito",
		"Medicina",
	}

	got := DeduplicateCursos(input)
	sort.Strings(got)
	sort.Strings(expected)

	if !reflect.DeepEqual(got, expected) {
		t.Errorf("expected %v, got %v", expected, got)
	}
}
