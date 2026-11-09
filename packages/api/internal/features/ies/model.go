package ies

import (
	"api_estudante/internal/elasticsearch"
	"api_estudante/internal/httpx"
)

// IES representa uma Instituição de Educação Superior no índice "ies".
// O _id do documento é o próprio co_ies.
type IES struct {
	NuAnoCenso *int   `json:"nu_ano_censo,omitempty"`
	DtCarga    string `json:"dt_carga,omitempty"`

	CoIES string `json:"co_ies,omitempty"`
	NoIES string `json:"no_ies,omitempty"`
	SgIES string `json:"sg_ies,omitempty"`

	Mantenedora Mantenedora `json:"mantenedora"`

	CategoriaAdministrativa CategoriaAdministrativa `json:"categoria_administrativa"`
	OrganizacaoAcademica    OrganizacaoAcademica    `json:"organizacao_academica"`
	Rede                    Rede                    `json:"rede"`

	Localizacao Localizacao `json:"localizacao"`

	Docentes        Docentes        `json:"docentes"`
	VagasMatriculas VagasMatriculas `json:"vagas_matriculas"`
}

// Mantenedora representa a mantenedora da IES.
type Mantenedora struct {
	CoMantenedora string `json:"co_mantenedora,omitempty"`
	NoMantenedora string `json:"no_mantenedora,omitempty"`
}

// CategoriaAdministrativa representa o tipo e a descrição da categoria
// administrativa da IES.
type CategoriaAdministrativa struct {
	TpCategoriaAdministrativa string `json:"tp_categoria_administrativa,omitempty"`
	NoCategoriaAdministrativa string `json:"no_categoria_administrativa,omitempty"`
}

// OrganizacaoAcademica representa o tipo e a descrição da organização
// acadêmica da IES.
type OrganizacaoAcademica struct {
	TpOrganizacaoAcademica string `json:"tp_organizacao_academica,omitempty"`
	NoOrganizacaoAcademica string `json:"no_organizacao_academica,omitempty"`
}

// Rede representa a rede de ensino e indicadores da IES.
type Rede struct {
	TpRede         string `json:"tp_rede,omitempty"`
	InComunitaria  bool   `json:"in_comunitaria"`
	InConfessional bool   `json:"in_confessional"`
}

// Localizacao representa a localização da sede administrativa ou reitoria da
// IES.
type Localizacao struct {
	CoRegiao       string   `json:"co_regiao,omitempty"`
	NoRegiao       string   `json:"no_regiao,omitempty"`
	CoUF           string   `json:"co_uf,omitempty"`
	NoUF           string   `json:"no_uf,omitempty"`
	SgUF           string   `json:"sg_uf,omitempty"`
	CoMunicipio    string   `json:"co_municipio,omitempty"`
	NoMunicipio    string   `json:"no_municipio,omitempty"`
	InCapital      bool     `json:"in_capital"`
	CoMesorregiao  string   `json:"co_mesorregiao,omitempty"`
	NoMesorregiao  string   `json:"no_mesorregiao,omitempty"`
	CoMicrorregiao string   `json:"co_microrregiao,omitempty"`
	NoMicrorregiao string   `json:"no_microrregiao,omitempty"`
	Endereco       Endereco `json:"endereco"`
}

// Endereco representa o endereço da sede administrativa ou reitoria da IES.
type Endereco struct {
	DsEndereco            string `json:"ds_endereco,omitempty"`
	DsNumeroEndereco      string `json:"ds_numero_endereco,omitempty"`
	DsComplementoEndereco string `json:"ds_complemento_endereco,omitempty"`
	NoBairro              string `json:"no_bairro,omitempty"`
	NuCEP                 string `json:"nu_cep,omitempty"`
}

// Docentes reúne as métricas de corpo docente da IES.
type Docentes struct {
	QtDocTotal           *int     `json:"qt_doc_total,omitempty"`
	QtDocExe             *int     `json:"qt_doc_exe,omitempty"`
	QtCursos             *int     `json:"qt_cursos,omitempty"`
	DocPorCurso          *float64 `json:"doc_por_curso,omitempty"`
	QtDocExSemGrad       *int     `json:"qt_doc_ex_sem_grad,omitempty"`
	MediaSemGradPorCurso *float64 `json:"media_sem_grad_por_curso,omitempty"`
	PercSemGrad          *float64 `json:"perc_sem_grad,omitempty"`
	QtDocExGrad          *int     `json:"qt_doc_ex_grad,omitempty"`
	MediaGradPorCurso    *float64 `json:"media_grad_por_curso,omitempty"`
	PercGrad             *float64 `json:"perc_grad,omitempty"`
	QtDocExEsp           *int     `json:"qt_doc_ex_esp,omitempty"`
	MediaEspPorCurso     *float64 `json:"media_esp_por_curso,omitempty"`
	PercEsp              *float64 `json:"perc_esp,omitempty"`
	QtDocExMest          *int     `json:"qt_doc_ex_mest,omitempty"`
	MediaMestPorCurso    *float64 `json:"media_mest_por_curso,omitempty"`
	PercMestres          *float64 `json:"perc_mestres,omitempty"`
	QtDocExDout          *int     `json:"qt_doc_ex_dout,omitempty"`
	MediaDoutPorCurso    *float64 `json:"media_dout_por_curso,omitempty"`
	PercDoutores         *float64 `json:"perc_doutores,omitempty"`
}

// VagasMatriculas reúne as métricas de vagas, ingressantes e matriculados da
// IES.
type VagasMatriculas struct {
	QtVg             *int     `json:"qt_vg,omitempty"`
	QtIng            *int     `json:"qt_ing,omitempty"`
	QtMat            *int     `json:"qt_mat,omitempty"`
	MediaIngPorCurso *float64 `json:"media_ing_por_curso,omitempty"`
	MediaMatPorCurso *float64 `json:"media_mat_por_curso,omitempty"`
	MediaVgPorCurso  *float64 `json:"media_vg_por_curso,omitempty"`
}

// SearchFilterParams contém parâmetros opcionais de filtragem e ordenação.
type SearchFilterParams struct {
	UF          []string
	Municipio   []string
	Regiao      []string
	Categoria   []string
	Organizacao []string
	Sort        string
}

// AggregationBucket representa um item de contagem de uma agregação.
// Aliás do tipo compartilhado, mantido para preservar a API do pacote.
type AggregationBucket = elasticsearch.AggregationBucket

// SearchAggregations mapeia as agregações por grupo de filtro.
type SearchAggregations struct {
	UFs          []AggregationBucket `json:"ufs,omitempty"`
	Municipios   []AggregationBucket `json:"municipios,omitempty"`
	Regioes      []AggregationBucket `json:"regioes,omitempty"`
	Categorias   []AggregationBucket `json:"categorias,omitempty"`
	Organizacoes []AggregationBucket `json:"organizacoes,omitempty"`
}

// PaginationLinks contém URLs HATEOAS para navegação de páginas.
// Aliás do tipo compartilhado, mantido para preservar a API do pacote.
type PaginationLinks = httpx.PaginationLinks

// IESListResponse é a resposta paginada de busca de IES.
type IESListResponse struct {
	Total        int                 `json:"total"`
	Page         int                 `json:"page"`
	Limit        int                 `json:"limit"`
	Results      []IES               `json:"results"`
	Links        PaginationLinks     `json:"links"`
	Aggregations *SearchAggregations `json:"aggregations,omitempty"`
}
