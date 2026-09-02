package cursos

// CursoListResponse é a resposta paginada de busca de cursos
type CursoListResponse struct {
	Total   int              `json:"total"`
	Page    int              `json:"page"`
	Limit   int              `json:"limit"`
	Results []Curso          `json:"results"`
	Links   PaginationLinks  `json:"links"`
}

// PaginationLinks contém URLs HATEOAS para navegação de páginas
type PaginationLinks struct {
	Self  string  `json:"self"`
	First string  `json:"first"`
	Prev  *string `json:"prev,omitempty"`
	Next  *string `json:"next,omitempty"`
	Last  string  `json:"last"`
}

// Curso representa um curso completo no índice de cursos
type Curso struct {
	Sequencial    *int64        `json:"sequencial,omitempty"`
	NuAnoCenso    *int          `json:"nu_ano_censo,omitempty"`
	Edicao        string        `json:"edicao,omitempty"`
	DtCarga       string        `json:"dt_carga,omitempty"`
	Instituicao   Instituicao   `json:"instituicao"`
	Curso         DadosCurso    `json:"curso"`
	Localizacao   Localizacao   `json:"localizacao"`
	CensoMetricas CensoMetricas `json:"censo_metricas"`
	Enade         Enade         `json:"enade"`
	Tda           Tda           `json:"tda"`
	Sisu          Sisu          `json:"sisu"`
}

// Instituicao representa a IES à qual o curso pertence
type Instituicao struct {
	CoIES string `json:"co_ies,omitempty"`
}

// DadosCurso representa os dados do curso
type DadosCurso struct {
	CoCurso            string `json:"co_curso,omitempty"`
	NoCurso            string `json:"no_curso,omitempty"`
	TpDimensao         *int   `json:"tp_dimensao,omitempty"`
	TpGrauAcademico    string `json:"tp_grau_academico,omitempty"`
	NoGrauAcademico    string `json:"no_grau_academico,omitempty"`
	InGratuito         bool   `json:"in_gratuito"`
	TpModalidadeEnsino string `json:"tp_modalidade_ensino,omitempty"`
	NoModalidadeEnsino string `json:"no_modalidade_ensino,omitempty"`
	TpNivelAcademico   string `json:"tp_nivel_academico,omitempty"`
	NoNivelAcademico   string `json:"no_nivel_academico,omitempty"`
	Cine               Cine   `json:"cine"`
}

// Cine representa a classificação CINE do curso
type Cine struct {
	CoCineRotulo         string `json:"co_cine_rotulo,omitempty"`
	NoCineRotulo         string `json:"no_cine_rotulo,omitempty"`
	CoCineAreaGeral      string `json:"co_cine_area_geral,omitempty"`
	NoCineAreaGeral      string `json:"no_cine_area_geral,omitempty"`
	CoCineAreaEspecifica string `json:"co_cine_area_especifica,omitempty"`
	NoCineAreaEspecifica string `json:"no_cine_area_especifica,omitempty"`
	CoCineAreaDetalhada  string `json:"co_cine_area_detalhada,omitempty"`
	NoCineAreaDetalhada  string `json:"no_cine_area_detalhada,omitempty"`
}

// Localizacao representa a localização do curso
type Localizacao struct {
	CoRegiao    string `json:"co_regiao,omitempty"`
	NoRegiao    string `json:"no_regiao,omitempty"`
	CoUF        string `json:"co_uf,omitempty"`
	NoUF        string `json:"no_uf,omitempty"`
	SgUF        string `json:"sg_uf,omitempty"`
	CoMunicipio string `json:"co_municipio,omitempty"`
	NoMunicipio string `json:"no_municipio,omitempty"`
	InCapital   bool   `json:"in_capital"`
}

// CensoMetricas representa métricas do Censo da Educação Superior
type CensoMetricas struct {
	QtVgTotal                *int `json:"qt_vg_total,omitempty"`
	QtVgTotalDiurno          *int `json:"qt_vg_total_diurno,omitempty"`
	QtVgTotalNoturno         *int `json:"qt_vg_total_noturno,omitempty"`
	QtVgTotalEAD             *int `json:"qt_vg_total_ead,omitempty"`
	QtIng                    *int `json:"qt_ing,omitempty"`
	QtIngProuniI             *int `json:"qt_ing_prounii,omitempty"`
	QtIngProuniP             *int `json:"qt_ing_prounip,omitempty"`
	QtIngFies                *int `json:"qt_ing_fies,omitempty"`
	QtIngRPFies              *int `json:"qt_ing_rpfies,omitempty"`
	QtIngNRPFies             *int `json:"qt_ing_nrpfies,omitempty"`
	QtIngReservaVaga         *int `json:"qt_ing_reserva_vaga,omitempty"`
	QtMat                    *int `json:"qt_mat,omitempty"`
	QtApoioSocial            *int `json:"qt_apoio_social,omitempty"`
	QtMatApoioSocial         *int `json:"qt_mat_apoio_social,omitempty"`
	QtAtivExtracurricular    *int `json:"qt_ativ_extracurricular,omitempty"`
	QtMatAtivExtracurricular *int `json:"qt_mat_ativ_extracurricular,omitempty"`
}

// Enade representa os resultados do curso no ENADE
type Enade struct {
	AnoEnade              *int     `json:"ano_enade,omitempty"`
	ConceitoContinuoEnade *float64 `json:"conceito_continuo_enade,omitempty"`
	ConceitoFaixaEnade    string   `json:"conceito_faixa_enade,omitempty"`
}

// Tda representa as taxas de transição do curso
type Tda struct {
	NuAnoIngressoTda   *int     `json:"nu_ano_ingresso_tda,omitempty"`
	NuAnoReferenciaTda *int     `json:"nu_ano_referencia_tda,omitempty"`
	TAP                *float64 `json:"tap,omitempty"`
	TCA                *float64 `json:"tca,omitempty"`
	TDA                *float64 `json:"tda,omitempty"`
}

// Sisu representa as informações e ofertas do curso no SISU
type Sisu struct {
	TemSisu bool     `json:"tem_sisu"`
	Ofertas []Oferta `json:"ofertas"`
}

// Oferta representa uma oferta do SISU para o curso
type Oferta struct {
	Municipio       string   `json:"municipio,omitempty"`
	NomeMunicipio   string   `json:"nome_municipio,omitempty"`
	Turno           string   `json:"turno,omitempty"`
	Modalidade      string   `json:"modalidade,omitempty"`
	OrdemModalidade *int     `json:"ordem_modalidade,omitempty"`
	Grupo           string   `json:"grupo,omitempty"`
	Descricao       string   `json:"descricao,omitempty"`
	Vagas           *int     `json:"vagas,omitempty"`
	NotaCorte       *float64 `json:"nota_corte,omitempty"`
	Inscricoes      *int     `json:"inscricoes,omitempty"`
}
