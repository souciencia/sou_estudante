package mapper

import "bulker/internal/model"

// ToDocument converte um registro achatado da origem no documento indexado.
func ToDocument(src model.SourceRecord) model.Document {
	return model.Document{
		Sequencial:  src.Sequencial,
		NuAnoCenso:  src.NuAnoCenso,
		Edicao:      intToStr(src.NuAnoCenso),
		DtCarga:     src.DtCarga,
		Instituicao: mapInstituicao(src),
		Curso:       mapCurso(src),
		Localizacao: mapLocalizacao(src),
		CensoMetricas: model.CensoMetricas{
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
		Enade: model.Enade{
			AnoEnade:              src.EnadeAnoEnade,
			ConceitoContinuoEnade: src.EnadeConceitoContinuoEnade,
			ConceitoFaixaEnade:    src.EnadeConceitoFaixaEnade,
		},
		Tda: model.Tda{
			NuAnoIngressoTda:   src.TdaNuAnoIngressoTda,
			NuAnoReferenciaTda: src.TdaNuAnoReferenciaTda,
			TAP:                src.TdaTap,
			TCA:                src.TdaTca,
			TDA:                src.TdaTda,
		},
		Sisu: model.Sisu{
			TemSisu: intToBool(src.SisuTemSisu),
			Ofertas: mapOfertas(src.SisuOfertas),
		},
	}
}

func mapInstituicao(src model.SourceRecord) model.Instituicao {
	return model.Instituicao{CoIES: intToStr(src.IESCoIES)}
}

func mapCurso(src model.SourceRecord) model.Curso {
	return model.Curso{
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
		Cine: model.Cine{
			CoCineRotulo:         src.CursoCoCineRotulo,
			NoCineRotulo:         src.CursoNoCineRotulo,
			CoCineAreaGeral:      intToStr(src.CursoCoCineAreaGeral),
			NoCineAreaGeral:      src.CursoNoCineAreaGeral,
			CoCineAreaEspecifica: intToStr(src.CursoCoCineAreaEspecifica),
			NoCineAreaEspecifica: src.CursoNoCineAreaEspecifica,
			CoCineAreaDetalhada:  intToStr(src.CursoCoCineAreaDetalhada),
			NoCineAreaDetalhada:  src.CursoNoCineAreaDetalhada,
		},
	}
}

func mapLocalizacao(src model.SourceRecord) model.Localizacao {
	return model.Localizacao{
		CoRegiao:    intToStr(src.CursoCoRegiao),
		NoRegiao:    src.CursoNoRegiao,
		CoUF:        intToStr(src.CursoCoUF),
		NoUF:        src.CursoNoUF,
		SgUF:        src.CursoSgUF,
		CoMunicipio: intToStr(src.CursoCoMunicipio),
		NoMunicipio: src.CursoNoMunicipio,
		InCapital:   intToBool(src.CursoInCapital),
	}
}

func mapOfertas(src []model.OfertaSource) []model.Oferta {
	ofertas := make([]model.Oferta, 0, len(src))
	for _, oferta := range src {
		ofertas = append(ofertas, model.Oferta{
			Municipio:       intToStr(oferta.Municipio),
			NomeMunicipio:   oferta.NomeMunicipio,
			Turno:           oferta.Turno,
			Modalidade:      oferta.Modalidade,
			OrdemModalidade: oferta.OrdemModalidade,
			Grupo:           oferta.Grupo,
			Descricao:       oferta.Descricao,
			Vagas:           oferta.Vagas,
			NotaCorte:       oferta.NotaCorte,
			Inscricoes:      oferta.Inscricoes,
		})
	}
	return ofertas
}
