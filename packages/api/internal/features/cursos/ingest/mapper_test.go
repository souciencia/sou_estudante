package ingest

import (
	"reflect"
	"testing"

	"api_estudante/internal/features/cursos"
)

func intPtr(value int) *int {
	return &value
}

func int64Ptr(value int64) *int64 {
	return &value
}

func float64Ptr(value float64) *float64 {
	return &value
}

func TestToDocumentConverteRegistroCompleto(t *testing.T) {
	src := SourceRecord{
		Sequencial:                    int64Ptr(10),
		NuAnoCenso:                    intPtr(2024),
		IESCoIES:                      intPtr(42),
		CursoCoCurso:                  intPtr(7),
		CursoNoCurso:                  "DIREITO",
		CursoCoCineRotulo:             "0112",
		CursoNoCineRotulo:             "DIREITO",
		CursoCoCineAreaGeral:          intPtr(1),
		CursoNoCineAreaGeral:          "EDUCAÇÃO",
		CursoCoCineAreaEspecifica:     intPtr(11),
		CursoNoCineAreaEspecifica:     "EDUCAÇÃO",
		CursoCoCineAreaDetalhada:      intPtr(111),
		CursoNoCineAreaDetalhada:      "DIREITO",
		CursoTpGrauAcademico:          intPtr(1),
		CursoNoGrauAcademico:          "BACHARELADO",
		CursoInGratuito:               intPtr(0),
		CursoTpModalidadeEnsino:       intPtr(1),
		CursoNoModalidadeEnsino:       "PRESENCIAL",
		CursoTpNivelAcademico:         intPtr(1),
		CursoNoNivelAcademico:         "GRADUAÇÃO",
		CursoCoRegiao:                 intPtr(5),
		CursoNoRegiao:                 "CENTRO-OESTE",
		CursoCoUF:                     intPtr(51),
		CursoNoUF:                     "MATO GROSSO",
		CursoSgUF:                     "MT",
		CursoCoMunicipio:              intPtr(5103403),
		CursoNoMunicipio:              "CUIABÁ",
		CursoInCapital:                intPtr(1),
		CursoQtVgTotal:                intPtr(100),
		CursoQtVgTotalDiurno:          intPtr(60),
		CursoQtVgTotalNoturno:         intPtr(40),
		CursoQtVgTotalEAD:             intPtr(0),
		CursoQtIng:                    intPtr(50),
		CursoQtIngProuniI:             intPtr(5),
		CursoQtIngProuniP:             intPtr(6),
		CursoQtIngFies:                intPtr(7),
		CursoQtIngRPFies:              intPtr(8),
		CursoQtIngNRPFies:             intPtr(9),
		CursoQtIngReservaVaga:         intPtr(10),
		CursoQtMat:                    intPtr(200),
		CursoQtApoioSocial:            intPtr(3),
		CursoQtMatApoioSocial:         intPtr(4),
		CursoQtAtivExtracurricular:    intPtr(5),
		CursoQtMatAtivExtracurricular: intPtr(6),
		CursoTpDimensao:               intPtr(2),
		EnadeAnoEnade:                 intPtr(2023),
		EnadeConceitoContinuoEnade:    float64Ptr(3.5),
		EnadeConceitoFaixaEnade:       "4",
		TdaNuAnoIngressoTda:           intPtr(2018),
		TdaNuAnoReferenciaTda:         intPtr(2022),
		TdaTap:                        float64Ptr(0.8),
		TdaTca:                        float64Ptr(0.7),
		TdaTda:                        float64Ptr(0.1),
		SisuTemSisu:                   intPtr(1),
		SisuOfertas: []OfertaSource{
			{Municipio: intPtr(5103403), NomeMunicipio: "CUIABÁ", Turno: "MATUTINO", Modalidade: "Ampla concorrência", OrdemModalidade: intPtr(1), Grupo: "A", Descricao: "desc", Vagas: intPtr(10), NotaCorte: float64Ptr(700.5), Inscricoes: intPtr(123)},
		},
		DtCarga: "2024-01-01",
	}

	info := InstituicaoInfo{
		NoIES:                   "UNIVERSIDADE DA AMAZÔNIA",
		SgIES:                   "UNAMA",
		CategoriaAdministrativa: "Privada com fins lucrativos",
		OrganizacaoAcademica:    "Universidade",
	}

	want := cursos.Curso{
		Sequencial: int64Ptr(10),
		NuAnoCenso: intPtr(2024),
		Edicao:     "2024",
		DtCarga:    "2024-01-01",
		Instituicao: cursos.Instituicao{
			CoIES:                   "42",
			NoIES:                   info.NoIES,
			SgIES:                   info.SgIES,
			CategoriaAdministrativa: info.CategoriaAdministrativa,
			OrganizacaoAcademica:    info.OrganizacaoAcademica,
		},
		Curso: cursos.DadosCurso{
			CoCurso:            "7",
			NoCurso:            "DIREITO",
			TpDimensao:         intPtr(2),
			TpGrauAcademico:    "1",
			NoGrauAcademico:    "BACHARELADO",
			InGratuito:         false,
			TpModalidadeEnsino: "1",
			NoModalidadeEnsino: "PRESENCIAL",
			TpNivelAcademico:   "1",
			NoNivelAcademico:   "GRADUAÇÃO",
			Cine: cursos.Cine{
				CoCineRotulo:         "0112",
				NoCineRotulo:         "DIREITO",
				CoCineAreaGeral:      "1",
				NoCineAreaGeral:      "EDUCAÇÃO",
				CoCineAreaEspecifica: "11",
				NoCineAreaEspecifica: "EDUCAÇÃO",
				CoCineAreaDetalhada:  "111",
				NoCineAreaDetalhada:  "DIREITO",
			},
		},
		Localizacao: cursos.Localizacao{
			CoRegiao:    "5",
			NoRegiao:    "CENTRO-OESTE",
			CoUF:        "51",
			NoUF:        "MATO GROSSO",
			SgUF:        "MT",
			CoMunicipio: "5103403",
			NoMunicipio: "CUIABÁ",
			InCapital:   true,
		},
		CensoMetricas: cursos.CensoMetricas{
			QtVgTotal:                intPtr(100),
			QtVgTotalDiurno:          intPtr(60),
			QtVgTotalNoturno:         intPtr(40),
			QtVgTotalEAD:             intPtr(0),
			QtIng:                    intPtr(50),
			QtIngProuniI:             intPtr(5),
			QtIngProuniP:             intPtr(6),
			QtIngFies:                intPtr(7),
			QtIngRPFies:              intPtr(8),
			QtIngNRPFies:             intPtr(9),
			QtIngReservaVaga:         intPtr(10),
			QtMat:                    intPtr(200),
			QtApoioSocial:            intPtr(3),
			QtMatApoioSocial:         intPtr(4),
			QtAtivExtracurricular:    intPtr(5),
			QtMatAtivExtracurricular: intPtr(6),
		},
		Enade: cursos.Enade{
			AnoEnade:              intPtr(2023),
			ConceitoContinuoEnade: float64Ptr(3.5),
			ConceitoFaixaEnade:    "4",
		},
		Tda: cursos.Tda{
			NuAnoIngressoTda:   intPtr(2018),
			NuAnoReferenciaTda: intPtr(2022),
			TAP:                float64Ptr(0.8),
			TCA:                float64Ptr(0.7),
			TDA:                float64Ptr(0.1),
		},
		Sisu: cursos.Sisu{
			TemSisu: true,
			Ofertas: []cursos.Oferta{
				{Municipio: "5103403", NomeMunicipio: "CUIABÁ", Turno: "MATUTINO", Modalidade: "Ampla concorrência", OrdemModalidade: intPtr(1), Grupo: "A", Descricao: "desc", Vagas: intPtr(10), NotaCorte: float64Ptr(700.5), Inscricoes: intPtr(123)},
			},
		},
	}

	if got := ToDocument(src, info); !reflect.DeepEqual(got, want) {
		t.Errorf("documento = %+v, esperado %+v", got, want)
	}
}

func TestToDocumentSemNuAnoCensoDeixaEdicaoVazia(t *testing.T) {
	doc := ToDocument(SourceRecord{}, InstituicaoInfo{})
	if doc.Edicao != "" {
		t.Errorf("edicao = %q, esperado vazio quando nu_ano_censo é nil", doc.Edicao)
	}
}
