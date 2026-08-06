package main

type Document struct {
	Sequencial   *int64              `json:"sequencial,omitempty"`
	NuAnoCenso   *int                `json:"nu_ano_censo,omitempty"`
	Edicao       string              `json:"edicao,omitempty"`
	DtCarga      string              `json:"dt_carga,omitempty"`
	Instituicao  InstituicaoStruct   `json:"instituicao"`
	Curso        CursoStruct         `json:"curso"`
	Localizacao  LocalizacaoStruct   `json:"localizacao"`
	CensoMetricas CensoMetricasStruct`json:"censo_metricas"`
	QualidadeMEC QualidadeMECStruct  `json:"qualidade_mec"`
	Sisu         SisuStruct          `json:"sisu"`
}

type InstituicaoStruct struct {
	CoIES                         string             `json:"co_ies,omitempty"`
	NoIES                         string             `json:"no_ies,omitempty"`
	SgIES                         string             `json:"sg_ies,omitempty"`
	CoMantenedoraIES              string             `json:"co_mantenedora_ies,omitempty"`
	NoMantenedoraIES              string             `json:"no_mantenedora_ies,omitempty"`
	TpCategoriaAdministrativaIES  string             `json:"tp_categoria_administrativa_ies,omitempty"`
	NoCategoriaAdministrativaIES  string             `json:"no_categoria_administrativa_ies,omitempty"`
	TpOrganizacaoAcademicaIES     string             `json:"tp_organizacao_academica_ies,omitempty"`
	NoOrganizacaoAcademicaIES     string             `json:"no_organizacao_academica_ies,omitempty"`
	TpRedeIES                     string             `json:"tp_rede_ies,omitempty"`
	InComunitariaIES              bool               `json:"in_comunitaria_ies"`
	InConfessionalIES             bool               `json:"in_confessional_ies"`
	Endereco                      EnderecoStruct     `json:"endereco"`
	CorpoDocente                  CorpoDocenteStruct `json:"corpo_docente"`
}

type EnderecoStruct struct {
	DsEnderecoIES           string `json:"ds_endereco_ies,omitempty"`
	DsNumeroEnderecoIES     string `json:"ds_numero_endereco_ies,omitempty"`
	DsComplementoEnderecoIES string `json:"ds_complemento_endereco_ies,omitempty"`
	NoBairroIES             string `json:"no_bairro_ies,omitempty"`
	NuCepIES                string `json:"nu_cep_ies,omitempty"`
}

type CorpoDocenteStruct struct {
	QtDocTotal  *int     `json:"qt_doc_total,omitempty"`
	QtDocExe    *int     `json:"qt_doc_exe,omitempty"`
	DocPorCurso *float64 `json:"doc_por_curso,omitempty"`
	PercGrad    *float64 `json:"perc_grad,omitempty"`
	PercEsp     *float64 `json:"perc_esp,omitempty"`
	PercMestres *float64 `json:"perc_mestres,omitempty"`
	PercDoutores *float64 `json:"perc_doutores,omitempty"`
}

type CursoStruct struct {
	CoCurso            string     `json:"co_curso,omitempty"`
	NoCurso            string     `json:"no_curso,omitempty"`
	TpGrauAcademico    string     `json:"tp_grau_academico,omitempty"`
	NoGrauAcademico    string     `json:"no_grau_academico,omitempty"`
	InGratuito         bool       `json:"in_gratuito"`
	TpModalidadeEnsino string     `json:"tp_modalidade_ensino,omitempty"`
	NoModalidadeEnsino string     `json:"no_modalidade_ensino,omitempty"`
	TpNivelAcademico   string     `json:"tp_nivel_academico,omitempty"`
	NoNivelAcademico   string     `json:"no_nivel_academico,omitempty"`
	Cine               CineStruct `json:"cine"`
}

type CineStruct struct {
	CoCineRotulo         string `json:"co_cine_rotulo,omitempty"`
	NoCineRotulo         string `json:"no_cine_rotulo,omitempty"`
	CoCineAreaGeral      string `json:"co_cine_area_geral,omitempty"`
	NoCineAreaGeral      string `json:"no_cine_area_geral,omitempty"`
	CoCineAreaEspecifica string `json:"co_cine_area_especifica,omitempty"`
	NoCineAreaEspecifica string `json:"no_cine_area_especifica,omitempty"`
	CoCineAreaDetalhada  string `json:"co_cine_area_detalhada,omitempty"`
	NoCineAreaDetalhada  string `json:"no_cine_area_detalhada,omitempty"`
}

type LocalizacaoStruct struct {
	CoRegiao          string `json:"co_regiao,omitempty"`
	NoRegiao          string `json:"no_regiao,omitempty"`
	CoUF              string `json:"co_uf,omitempty"`
	NoUF              string `json:"no_uf,omitempty"`
	SgUF              string `json:"sg_uf,omitempty"`
	CoMunicipio       string `json:"co_municipio,omitempty"`
	NoMunicipio       string `json:"no_municipio,omitempty"`
	InCapital         bool   `json:"in_capital"`
	NoCampus          string `json:"no_campus,omitempty"`
	NoMunicipioCampus string `json:"no_municipio_campus,omitempty"`
	SgUFCampus        string `json:"sg_uf_campus,omitempty"`
	DsRegiaoCampus    string `json:"ds_regiao_campus,omitempty"`
}

type CensoMetricasStruct struct {
	QtVgTotal                 *int `json:"qt_vg_total,omitempty"`
	QtVgTotalDiurno           *int `json:"qt_vg_total_diurno,omitempty"`
	QtVgTotalNoturno          *int `json:"qt_vg_total_noturno,omitempty"`
	QtVgTotalEAD              *int `json:"qt_vg_total_ead,omitempty"`
	QtIng                     *int `json:"qt_ing,omitempty"`
	QtIngProuniI              *int `json:"qt_ing_prounii,omitempty"`
	QtIngProuniP              *int `json:"qt_ing_prounip,omitempty"`
	QtIngFies                 *int `json:"qt_ing_fies,omitempty"`
	QtIngReservaVaga          *int `json:"qt_ing_reserva_vaga,omitempty"`
	QtMat                     *int `json:"qt_mat,omitempty"`
	QtApoioSocial             *int `json:"qt_apoio_social,omitempty"`
	QtMatApoioSocial          *int `json:"qt_mat_apoio_social,omitempty"`
	QtAtivExtracurricular     *int `json:"qt_ativ_extracurricular,omitempty"`
	QtMatAtivExtracurricular  *int `json:"qt_mat_ativ_extracurricular,omitempty"`
}

type QualidadeMECStruct struct {
	ConceitoEnadeContinuo *float64 `json:"conceito_enade_continuo,omitempty"`
	ConceitoEnadeFaixa    *int     `json:"conceito_enade_faixa,omitempty"`
	IDDContinuo           *float64 `json:"idd_continuo,omitempty"`
	IDDFaixa              *int     `json:"idd_faixa,omitempty"`
	CPCContinuo           *float64 `json:"cpc_continuo,omitempty"`
	CPCFaixa              *int     `json:"cpc_faixa,omitempty"`
	IGCContinuo           *float64 `json:"igc_continuo,omitempty"`
	IGCFaixa              *int     `json:"igc_faixa,omitempty"`
	TAP                   *float64 `json:"tap,omitempty"`
	TCA                   *float64 `json:"tca,omitempty"`
	TDA                   *float64 `json:"tda,omitempty"`
}

type SisuStruct struct {
	TemSisu                    bool     `json:"tem_sisu"`
	DsTurno                    string   `json:"ds_turno,omitempty"`
	TpModConcorrencia          string   `json:"tp_mod_concorrencia,omitempty"`
	TipoConcorrencia           string   `json:"tipo_concorrencia,omitempty"`
	TipoConcorrenciaNormalizado string   `json:"tipo_concorrencia_normalizado,omitempty"`
	DsModConcorrencia          string   `json:"ds_mod_concorrencia,omitempty"`
	QtVagasConcorrencia        *int     `json:"qt_vagas_concorrencia,omitempty"`
	NuNotacorte                *float64 `json:"nu_notacorte,omitempty"`
	QtInscricao                *int     `json:"qt_inscricao,omitempty"`
}