package ingest

import "api_estudante/internal/features/cursos"

// InstituicaoInfo agrupa atributos da IES usados para enriquecer o documento
// de curso no momento da ingestão.
type InstituicaoInfo struct {
	NoIES                   string
	SgIES                   string
	CategoriaAdministrativa string
	OrganizacaoAcademica    string
}

// ToDocument converte um registro achatado da origem no documento indexado,
// enriquecendo a instituição com os dados da IES correspondente.
func ToDocument(src SourceRecord, info InstituicaoInfo) cursos.Curso {
	return cursos.Curso{
		Sequencial:  src.Sequencial,
		NuAnoCenso:  src.NuAnoCenso,
		Edicao:      intToStr(src.NuAnoCenso),
		DtCarga:     src.DtCarga,
		Instituicao: mapInstituicao(src, info),
		Curso:       mapCurso(src),
		Localizacao: mapLocalizacao(src),
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

func mapInstituicao(src SourceRecord, info InstituicaoInfo) cursos.Instituicao {
	return cursos.Instituicao{
		CoIES:                   intToStr(src.IESCoIES),
		NoIES:                   info.NoIES,
		SgIES:                   info.SgIES,
		CategoriaAdministrativa: info.CategoriaAdministrativa,
		OrganizacaoAcademica:    info.OrganizacaoAcademica,
	}
}

func mapCurso(src SourceRecord) cursos.DadosCurso {
	return cursos.DadosCurso{
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
	}
}

func mapLocalizacao(src SourceRecord) cursos.Localizacao {
	return cursos.Localizacao{
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

func mapOfertas(src []OfertaSource) []cursos.Oferta {
	ofertas := make([]cursos.Oferta, 0, len(src))
	for _, oferta := range src {
		ofertas = append(ofertas, cursos.Oferta{
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
