package ies

// SourceRecord representa um registro do arquivo NDJSON de origem das IES,
// antes de ser mapeado no Document.
type SourceRecord struct {
	CoIES                   string `json:"co_ies"`
	NoIES                   string `json:"no_ies"`
	SgIES                   string `json:"sg_ies"`
	CategoriaAdministrativa string `json:"categoria_administrativa"`
	OrganizacaoAcademica    string `json:"organizacao_academica"`
	Municipio               string `json:"municipio"`
	UF                      string `json:"uf"`
	Regiao                  string `json:"regiao"`
}
