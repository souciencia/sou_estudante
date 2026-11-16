package municipios

// Municipio é um par código IBGE/nome de município.
type Municipio struct {
	Codigo string `json:"codigo"`
	Nome   string `json:"nome"`
}

// Estado é o documento do índice estados-municipios: uma UF e seus municípios.
type Estado struct {
	UF         string      `json:"uf"`
	Municipios []Municipio `json:"municipios"`
}

// Response mapeia cada UF para a lista dos seus municípios.
type Response map[string][]Municipio
