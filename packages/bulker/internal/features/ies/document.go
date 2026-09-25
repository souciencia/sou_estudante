package ies

// Document é o documento (source) de uma IES indexado no Elasticsearch.
type Document struct {
	CoIES                   string `json:"co_ies,omitempty"`
	NoIES                   string `json:"no_ies,omitempty"`
	SgIES                   string `json:"sg_ies,omitempty"`
	CategoriaAdministrativa string `json:"categoria_administrativa,omitempty"`
	OrganizacaoAcademica    string `json:"organizacao_academica,omitempty"`
	Municipio               string `json:"municipio,omitempty"`
	UF                      string `json:"uf,omitempty"`
	Regiao                  string `json:"regiao,omitempty"`
}
