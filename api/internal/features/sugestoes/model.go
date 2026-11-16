package sugestoes

// Sugestao é um nome sugerido para autocomplete, com a contagem de documentos
// de origem que o possuem (ex.: número de cursos com aquele nome).
type Sugestao struct {
	Nome  string `json:"nome"`
	Count int    `json:"count"`
}

// SugestoesResponse é a resposta com as sugestões de nomes para autocomplete.
type SugestoesResponse struct {
	Results []Sugestao `json:"results"`
}
