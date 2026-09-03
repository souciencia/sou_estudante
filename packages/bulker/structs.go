package main

// SourceRecord representa um registro achatado do arquivo JSON de origem
// (amostra_dados.json), antes de ser agrupado no Document.
type SourceRecord struct {
	Sequencial                    *int64         `json:"sequencial"`
	NuAnoCenso                    *int           `json:"nu_ano_censo"`
	IESCoIES                      *int           `json:"ies_co_ies"`
	CursoCoCurso                  *int           `json:"curso_co_curso"`
	CursoNoCurso                  string         `json:"curso_no_curso"`
	CursoCoCineRotulo             string         `json:"curso_co_cine_rotulo"`
	CursoNoCineRotulo             string         `json:"curso_no_cine_rotulo"`
	CursoCoCineAreaGeral          *int           `json:"curso_co_cine_area_geral"`
	CursoNoCineAreaGeral          string         `json:"curso_no_cine_area_geral"`
	CursoCoCineAreaEspecifica     *int           `json:"curso_co_cine_area_especifica"`
	CursoNoCineAreaEspecifica     string         `json:"curso_no_cine_area_especifica"`
	CursoCoCineAreaDetalhada      *int           `json:"curso_co_cine_area_detalhada"`
	CursoNoCineAreaDetalhada      string         `json:"curso_no_cine_area_detalhada"`
	CursoTpGrauAcademico          *int           `json:"curso_tp_grau_academico"`
	CursoNoGrauAcademico          string         `json:"curso_no_grau_academico"`
	CursoInGratuito               *int           `json:"curso_in_gratuito"`
	CursoTpModalidadeEnsino       *int           `json:"curso_tp_modalidade_ensino"`
	CursoNoModalidadeEnsino       string         `json:"curso_no_modalidade_ensino"`
	CursoTpNivelAcademico         *int           `json:"curso_tp_nivel_academico"`
	CursoNoNivelAcademico         string         `json:"curso_no_nivel_academico"`
	CursoCoRegiao                 *int           `json:"curso_co_regiao"`
	CursoNoRegiao                 string         `json:"curso_no_regiao"`
	CursoCoUF                     *int           `json:"curso_co_uf"`
	CursoNoUF                     string         `json:"curso_no_uf"`
	CursoSgUF                     string         `json:"curso_sg_uf"`
	CursoCoMunicipio              *int           `json:"curso_co_municipio"`
	CursoNoMunicipio              string         `json:"curso_no_municipio"`
	CursoInCapital                *int           `json:"curso_in_capital"`
	CursoQtVgTotal                *int           `json:"curso_qt_vg_total"`
	CursoQtVgTotalDiurno          *int           `json:"curso_qt_vg_total_diurno"`
	CursoQtVgTotalNoturno         *int           `json:"curso_qt_vg_total_noturno"`
	CursoQtVgTotalEAD             *int           `json:"curso_qt_vg_total_ead"`
	CursoQtIng                    *int           `json:"curso_qt_ing"`
	CursoQtIngProuniI             *int           `json:"curso_qt_ing_prounii"`
	CursoQtIngProuniP             *int           `json:"curso_qt_ing_prounip"`
	CursoQtIngFies                *int           `json:"curso_qt_ing_fies"`
	CursoQtIngRPFies              *int           `json:"curso_qt_ing_rpfies"`
	CursoQtIngNRPFies             *int           `json:"curso_qt_ing_nrpfies"`
	CursoQtIngReservaVaga         *int           `json:"curso_qt_ing_reserva_vaga"`
	CursoQtMat                    *int           `json:"curso_qt_mat"`
	CursoQtApoioSocial            *int           `json:"curso_qt_apoio_social"`
	CursoQtMatApoioSocial         *int           `json:"curso_qt_mat_apoio_social"`
	CursoQtAtivExtracurricular    *int           `json:"curso_qt_ativ_extracurricular"`
	CursoQtMatAtivExtracurricular *int           `json:"curso_qt_mat_ativ_extracurricular"`
	CursoTpDimensao               *int           `json:"curso_tp_dimensao"`
	EnadeAnoEnade                 *int           `json:"enade_ano_enade"`
	EnadeConceitoContinuoEnade    *float64       `json:"enade_conceito_continuo_enade"`
	EnadeConceitoFaixaEnade       string         `json:"enade_conceito_faixa_enade"`
	TdaNuAnoIngressoTda           *int           `json:"tda_nu_ano_ingresso_tda"`
	TdaNuAnoReferenciaTda         *int           `json:"tda_nu_ano_referencia_tda"`
	TdaTap                        *float64       `json:"tda_tap"`
	TdaTca                        *float64       `json:"tda_tca"`
	TdaTda                        *float64       `json:"tda_tda"`
	SisuTemSisu                   *int           `json:"sisu_tem_sisu"`
	SisuOfertas                   []OfertaSource `json:"sisu_ofertas"`
	DtCarga                       string         `json:"dt_carga"`
}

// OfertaSource representa uma oferta do SISU dentro de um SourceRecord.
type OfertaSource struct {
	Municipio       *int     `json:"municipio"`
	NomeMunicipio   string   `json:"nome_municipio"`
	Turno           string   `json:"turno"`
	Modalidade      string   `json:"modalidade"`
	OrdemModalidade *int     `json:"ordem_modalidade"`
	Grupo           string   `json:"grupo"`
	Descricao       string   `json:"descricao"`
	Vagas           *int     `json:"vagas"`
	NotaCorte       *float64 `json:"nota_corte"`
	Inscricoes      *int     `json:"inscricoes"`
}

// Document é o documento (source) indexado no Elasticsearch.
type Document struct {
	Sequencial    *int64              `json:"sequencial,omitempty"`
	NuAnoCenso    *int                `json:"nu_ano_censo,omitempty"`
	Edicao        string              `json:"edicao,omitempty"`
	DtCarga       string              `json:"dt_carga,omitempty"`
	Instituicao   InstituicaoStruct   `json:"instituicao"`
	Curso         CursoStruct         `json:"curso"`
	Localizacao   LocalizacaoStruct   `json:"localizacao"`
	CensoMetricas CensoMetricasStruct `json:"censo_metricas"`
	Enade         EnadeStruct         `json:"enade"`
	Tda           TdaStruct           `json:"tda"`
	Sisu          SisuStruct          `json:"sisu"`
}

type InstituicaoStruct struct {
	CoIES string `json:"co_ies,omitempty"`
}

type CursoStruct struct {
	CoCurso            string     `json:"co_curso,omitempty"`
	NoCurso            string     `json:"no_curso,omitempty"`
	TpDimensao         *int       `json:"tp_dimensao,omitempty"`
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
	CoRegiao    string `json:"co_regiao,omitempty"`
	NoRegiao    string `json:"no_regiao,omitempty"`
	CoUF        string `json:"co_uf,omitempty"`
	NoUF        string `json:"no_uf,omitempty"`
	SgUF        string `json:"sg_uf,omitempty"`
	CoMunicipio string `json:"co_municipio,omitempty"`
	NoMunicipio string `json:"no_municipio,omitempty"`
	InCapital   bool   `json:"in_capital"`
}

type CensoMetricasStruct struct {
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

type EnadeStruct struct {
	AnoEnade              *int     `json:"ano_enade,omitempty"`
	ConceitoContinuoEnade *float64 `json:"conceito_continuo_enade,omitempty"`
	ConceitoFaixaEnade    string   `json:"conceito_faixa_enade,omitempty"`
}

type TdaStruct struct {
	NuAnoIngressoTda   *int     `json:"nu_ano_ingresso_tda,omitempty"`
	NuAnoReferenciaTda *int     `json:"nu_ano_referencia_tda,omitempty"`
	TAP                *float64 `json:"tap,omitempty"`
	TCA                *float64 `json:"tca,omitempty"`
	TDA                *float64 `json:"tda,omitempty"`
}

type SisuStruct struct {
	TemSisu bool           `json:"tem_sisu"`
	Ofertas []OfertaStruct `json:"ofertas"`
}

type OfertaStruct struct {
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
