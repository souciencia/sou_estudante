package main

import (
	"strconv"

	"shared/cursos"
)

func intToStr(v *int) string {
	if v == nil {
		return ""
	}
	return strconv.Itoa(*v)
}

func intToBool(v *int) bool {
	return v != nil && *v == 1
}

func mapSourceToDocument(src SourceRecord) cursos.Document {
	return cursos.Document{
		Sequencial: src.Sequencial,
		NuAnoCenso: src.NuAnoCenso,
		Edicao:     intToStr(src.NuAnoCenso),
		DtCarga:    src.DtCarga,
		Instituicao: cursos.Instituicao{
			CoIES: intToStr(src.IESCoIES),
		},
		Curso: cursos.DadosCurso{
			CoCurso:            intToStr(src.CursoCoCurso),
			NoCurso:            src.CursoNoCurso,
			TpDimensao:         src.CursoTpDimensao,
			TpGrauAcademico:    intToStr(src.CursoTpGrauAcademico),
			NoGrauAcademico:    src.CursoNoGrauAcademico,
			InGratuito:         intToBool(src.CursoInGratuito),
			TpModalidadeEnsino: intToStr(src.CursoTpModalidadeEnsino),
			NoModalidadeEnsino: src.CursoNoModalidadeEnsino,
			TpNivelAcademico:   intToStr(src.CursoTpNivelAcademico),
			NoNivelAcademico:   src.CursoNoNivelAcademico,
			Cine: cursos.Cine{
				CoCineRotulo:         src.CursoCoCineRotulo,
				NoCineRotulo:         src.CursoNoCineRotulo,
				CoCineAreaGeral:      intToStr(src.CursoCoCineAreaGeral),
				NoCineAreaGeral:      src.CursoNoCineAreaGeral,
				CoCineAreaEspecifica: intToStr(src.CursoCoCineAreaEspecifica),
				NoCineAreaEspecifica: src.CursoNoCineAreaEspecifica,
				CoCineAreaDetalhada:  intToStr(src.CursoCoCineAreaDetalhada),
				NoCineAreaDetalhada:  src.CursoNoCineAreaDetalhada,
			},
		},
		Localizacao: cursos.Localizacao{
			CoRegiao:    intToStr(src.CursoCoRegiao),
			NoRegiao:    src.CursoNoRegiao,
			CoUF:        intToStr(src.CursoCoUF),
			NoUF:        src.CursoNoUF,
			SgUF:        src.CursoSgUF,
			CoMunicipio: intToStr(src.CursoCoMunicipio),
			NoMunicipio: src.CursoNoMunicipio,
			InCapital:   intToBool(src.CursoInCapital),
		},
		CensoMetricas: cursos.CensoMetricas{
			QtVgTotal:                src.CursoQtVgTotal,
			QtVgTotalDiurno:          src.CursoQtVgTotalDiurno,
			QtVgTotalNoturno:         src.CursoQtVgTotalNoturno,
			QtVgTotalEAD:             src.CursoQtVgTotalEAD,
			QtIng:                    src.CursoQtIng,
			QtIngProuniI:             src.CursoQtIngProuniI,
			QtIngProuniP:             src.CursoQtIngProuniP,
			QtIngFies:                src.CursoQtIngFies,
			QtIngRPFies:              src.CursoQtIngRPFies,
			QtIngNRPFies:             src.CursoQtIngNRPFies,
			QtIngReservaVaga:         src.CursoQtIngReservaVaga,
			QtMat:                    src.CursoQtMat,
			QtApoioSocial:            src.CursoQtApoioSocial,
			QtMatApoioSocial:         src.CursoQtMatApoioSocial,
			QtAtivExtracurricular:    src.CursoQtAtivExtracurricular,
			QtMatAtivExtracurricular: src.CursoQtMatAtivExtracurricular,
		},
		Enade: cursos.Enade{
			AnoEnade:              src.EnadeAnoEnade,
			ConceitoContinuoEnade: src.EnadeConceitoContinuoEnade,
			ConceitoFaixaEnade:    src.EnadeConceitoFaixaEnade,
		},
		Tda: cursos.Tda{
			NuAnoIngressoTda:   src.TdaNuAnoIngressoTda,
			NuAnoReferenciaTda: src.TdaNuAnoReferenciaTda,
			TAP:                src.TdaTap,
			TCA:                src.TdaTca,
			TDA:                src.TdaTda,
		},
		Sisu: cursos.Sisu{
			TemSisu: intToBool(src.SisuTemSisu),
			Ofertas: mapOfertas(src.SisuOfertas),
		},
	}
}

func mapOfertas(src []OfertaSource) []cursos.Oferta {
	ofertas := make([]cursos.Oferta, 0, len(src))
	for _, o := range src {
		ofertas = append(ofertas, cursos.Oferta{
			Municipio:       intToStr(o.Municipio),
			NomeMunicipio:   o.NomeMunicipio,
			Turno:           o.Turno,
			Modalidade:      o.Modalidade,
			OrdemModalidade: o.OrdemModalidade,
			Grupo:           o.Grupo,
			Descricao:       o.Descricao,
			Vagas:           o.Vagas,
			NotaCorte:       o.NotaCorte,
			Inscricoes:      o.Inscricoes,
		})
	}
	return ofertas
}
