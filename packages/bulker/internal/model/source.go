package model

// SourceRecord representa um registro achatado do arquivo JSON de origem,
// antes de ser agrupado no Document.
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
