// Package textcase normaliza textos de origem durante a ingestão, aplicando
// regras de caixa específicas do português.
package textcase

import (
	"strings"
	"unicode"
)

// conectivos são palavras que permanecem em minúsculas quando não iniciam o texto.
var conectivos = map[string]struct{}{
	"de": {}, "da": {}, "do": {}, "das": {}, "dos": {}, "e": {},
}

// Title converte a string para caixa de título: cada palavra (e cada segmento
// separado por hífen) recebe a inicial maiúscula, exceto os conectivos de, da,
// do, das, dos e e, que permanecem minúsculos quando não iniciam o texto.
func Title(s string) string {
	words := strings.Split(strings.ToLower(s), " ")
	for i, word := range words {
		if word == "" {
			continue
		}
		if i > 0 {
			if _, ok := conectivos[word]; ok {
				continue
			}
		}
		words[i] = capitalizeSegmentos(word)
	}
	return strings.Join(words, " ")
}

// capitalizeSegmentos capitaliza a inicial de cada segmento separado por hífen.
func capitalizeSegmentos(word string) string {
	segmentos := strings.Split(word, "-")
	for i, segmento := range segmentos {
		if segmento == "" {
			continue
		}
		r := []rune(segmento)
		r[0] = unicode.ToUpper(r[0])
		segmentos[i] = string(r)
	}
	return strings.Join(segmentos, "-")
}
