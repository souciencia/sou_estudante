package ies

// ⚠️ NÃO UTILIZADO ATUALMENTE
// Instituicao Cadastro representa o documento estático da IES
type InstituicaoCadastro struct {
	CoIES                  string `json:"co_ies"`
	NoIES                  string `json:"no_ies"`
	SgIES                  string `json:"sg_ies"`
	DsOrganizacaoAcademica string `json:"ds_organizacao_academica"`
	DsCategoriaAdm         string `json:"ds_categoria_adm"`
	NoCampus               string `json:"no_campus"`
	NoMunicipioCampus      string `json:"no_municipio_campus"`
	SgUFCampus             string `json:"sg_uf_campus"`
	DsRegiao               string `json:"ds_regiao"`
}
