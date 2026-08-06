package main

import (
	"strconv"
	"strings"
)

func getVal(record []string, hMap map[string]int, key string) string {
	if idx, ok := hMap[key]; ok && idx < len(record) {
		val := strings.TrimSpace(record[idx])
		if val == "" || val == "nan" || val == "NaN" || val == "None" {
			return ""
		}
		return val
	}
	return ""
}

func parseInt(val string) *int {
	if val == "" {
		return nil
	}
	v, err := strconv.Atoi(strings.Split(val, ".")[0])
	if err != nil {
		return nil
	}
	return &v
}

func parseInt64(val string) *int64 {
	if val == "" {
		return nil
	}
	v, err := strconv.ParseInt(strings.Split(val, ".")[0], 10, 64)
	if err != nil {
		return nil
	}
	return &v
}

func parseFloat(val string) *float64 {
	if val == "" {
		return nil
	}
	normalized := strings.ReplaceAll(val, ",", ".")
	v, err := strconv.ParseFloat(normalized, 64)
	if err != nil {
		return nil
	}
	return &v
}

func parseBool(val string) bool {
	v := strings.ToLower(strings.TrimSpace(val))
	return v == "1" || v == "true"
}

func mapRecordToDocument(r []string, h map[string]int) Document {
	return Document{
		Sequencial: parseInt64(getVal(r, h, "sequencial")),
		NuAnoCenso: parseInt(getVal(r, h, "nu_ano_censo")),
		Edicao:     getVal(r, h, "edicao"),
		DtCarga:    getVal(r, h, "dt_carga"),
		Instituicao: InstituicaoStruct{
			CoIES:                        getVal(r, h, "co_ies"),
			NoIES:                        getVal(r, h, "no_ies"),
			SgIES:                        getVal(r, h, "sg_ies"),
			CoMantenedoraIES:             getVal(r, h, "co_mantenedora_ies"),
			NoMantenedoraIES:             getVal(r, h, "no_mantenedora_ies"),
			TpCategoriaAdministrativaIES: getVal(r, h, "tp_categoria_administrativa_ies"),
			NoCategoriaAdministrativaIES: getVal(r, h, "no_categoria_administrativa_ies"),
			TpOrganizacaoAcademicaIES:    getVal(r, h, "tp_organizacao_academica_ies"),
			NoOrganizacaoAcademicaIES:    getVal(r, h, "no_organizacao_academica_ies"),
			TpRedeIES:                    getVal(r, h, "tp_rede_ies"),
			InComunitariaIES:             parseBool(getVal(r, h, "in_comunitaria_ies")),
			InConfessionalIES:            parseBool(getVal(r, h, "in_confessional_ies")),
			Endereco: EnderecoStruct{
				DsEnderecoIES:            getVal(r, h, "ds_endereco_ies"),
				DsNumeroEnderecoIES:      getVal(r, h, "ds_numero_endereco_ies"),
				DsComplementoEnderecoIES: getVal(r, h, "ds_complemento_endereco_ies"),
				NoBairroIES:              getVal(r, h, "no_bairro_ies"),
				NuCepIES:                 getVal(r, h, "nu_cep_ies"),
			},
			CorpoDocente: CorpoDocenteStruct{
				QtDocTotal:   parseInt(getVal(r, h, "qt_doc_total")),
				QtDocExe:     parseInt(getVal(r, h, "qt_doc_exe")),
				DocPorCurso:  parseFloat(getVal(r, h, "doc_por_curso")),
				PercGrad:     parseFloat(getVal(r, h, "perc_grad")),
				PercEsp:      parseFloat(getVal(r, h, "perc_esp")),
				PercMestres:  parseFloat(getVal(r, h, "perc_mestres")),
				PercDoutores: parseFloat(getVal(r, h, "perc_doutores")),
			},
		},
		Curso: CursoStruct{
			CoCurso:            getVal(r, h, "co_curso"),
			NoCurso:            getVal(r, h, "no_curso"),
			TpGrauAcademico:    getVal(r, h, "tp_grau_academico"),
			NoGrauAcademico:    getVal(r, h, "no_grau_academico"),
			InGratuito:         parseBool(getVal(r, h, "in_gratuito")),
			TpModalidadeEnsino: getVal(r, h, "tp_modalidade_ensino"),
			NoModalidadeEnsino: getVal(r, h, "no_modalidade_ensino"),
			TpNivelAcademico:   getVal(r, h, "tp_nivel_academico"),
			NoNivelAcademico:   getVal(r, h, "no_nivel_academico"),
			Cine: CineStruct{
				CoCineRotulo:         getVal(r, h, "co_cine_rotulo"),
				NoCineRotulo:         getVal(r, h, "no_cine_rotulo"),
				CoCineAreaGeral:      getVal(r, h, "co_cine_area_geral"),
				NoCineAreaGeral:      getVal(r, h, "no_cine_area_geral"),
				CoCineAreaEspecifica: getVal(r, h, "co_cine_area_especifica"),
				NoCineAreaEspecifica: getVal(r, h, "no_cine_area_especifica"),
				CoCineAreaDetalhada:  getVal(r, h, "co_cine_area_detalhada"),
				NoCineAreaDetalhada:  getVal(r, h, "no_cine_area_detalhada"),
			},
		},
		Localizacao: LocalizacaoStruct{
			CoRegiao:          getVal(r, h, "co_regiao"),
			NoRegiao:          getVal(r, h, "no_regiao"),
			CoUF:              getVal(r, h, "co_uf"),
			NoUF:              getVal(r, h, "no_uf"),
			SgUF:              getVal(r, h, "sg_uf"),
			CoMunicipio:       getVal(r, h, "co_municipio"),
			NoMunicipio:       getVal(r, h, "no_municipio"),
			InCapital:         parseBool(getVal(r, h, "in_capital")),
			NoCampus:          getVal(r, h, "no_campus"),
			NoMunicipioCampus: getVal(r, h, "no_municipio_campus"),
			SgUFCampus:        getVal(r, h, "sg_uf_campus"),
			DsRegiaoCampus:    getVal(r, h, "ds_regiao_campus"),
		},
		CensoMetricas: CensoMetricasStruct{
			QtVgTotal:                parseInt(getVal(r, h, "qt_vg_total")),
			QtVgTotalDiurno:          parseInt(getVal(r, h, "qt_vg_total_diurno")),
			QtVgTotalNoturno:         parseInt(getVal(r, h, "qt_vg_total_noturno")),
			QtVgTotalEAD:             parseInt(getVal(r, h, "qt_vg_total_ead")),
			QtIng:                    parseInt(getVal(r, h, "qt_ing")),
			QtIngProuniI:             parseInt(getVal(r, h, "qt_ing_prounii")),
			QtIngProuniP:             parseInt(getVal(r, h, "qt_ing_prounip")),
			QtIngFies:                parseInt(getVal(r, h, "qt_ing_fies")),
			QtIngReservaVaga:         parseInt(getVal(r, h, "qt_ing_reserva_vaga")),
			QtMat:                    parseInt(getVal(r, h, "qt_mat")),
			QtApoioSocial:            parseInt(getVal(r, h, "qt_apoio_social")),
			QtMatApoioSocial:         parseInt(getVal(r, h, "qt_mat_apoio_social")),
			QtAtivExtracurricular:    parseInt(getVal(r, h, "qt_ativ_extracurricular")),
			QtMatAtivExtracurricular: parseInt(getVal(r, h, "qt_mat_ativ_extracurricular")),
		},
		QualidadeMEC: QualidadeMECStruct{
			ConceitoEnadeContinuo: parseFloat(getVal(r, h, "conceito_enade_continuo")),
			ConceitoEnadeFaixa:    parseInt(getVal(r, h, "conceito_enade_faixa")),
			IDDContinuo:           parseFloat(getVal(r, h, "idd_continuo")),
			IDDFaixa:              parseInt(getVal(r, h, "idd_faixa")),
			CPCContinuo:           parseFloat(getVal(r, h, "cpc_continuo")),
			CPCFaixa:              parseInt(getVal(r, h, "cpc_faixa")),
			IGCContinuo:           parseFloat(getVal(r, h, "igc_continuo")),
			IGCFaixa:              parseInt(getVal(r, h, "igc_faixa")),
			TAP:                   parseFloat(getVal(r, h, "tap")),
			TCA:                   parseFloat(getVal(r, h, "tca")),
			TDA:                   parseFloat(getVal(r, h, "tda")),
		},
		Sisu: SisuStruct{
			TemSisu:                     parseBool(getVal(r, h, "tem_sisu")),
			DsTurno:                     getVal(r, h, "ds_turno"),
			TpModConcorrencia:           getVal(r, h, "tp_mod_concorrencia"),
			TipoConcorrencia:            getVal(r, h, "tipo_concorrencia"),
			TipoConcorrenciaNormalizado: getVal(r, h, "tipo_concorrencia_normalizado"),
			DsModConcorrencia:           getVal(r, h, "ds_mod_concorrencia"),
			QtVagasConcorrencia:         parseInt(getVal(r, h, "qt_vagas_concorrencia")),
			NuNotacorte:                 parseFloat(getVal(r, h, "nu_notacorte")),
			QtInscricao:                 parseInt(getVal(r, h, "qt_inscricao")),
		},
	}
}
