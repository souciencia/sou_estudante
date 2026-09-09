package sugestoes

// SugestoesResponse é a resposta com nomes de cursos sugeridos para autocomplete
type SugestoesResponse struct {
	Results []string `json:"results"`
}
