package ingest

import (
	"reflect"
	"testing"

	"api_estudante/internal/features/ies"
)

func intPtr(value int) *int {
	return &value
}

func floatPtr(value float64) *float64 {
	return &value
}

func TestToDocumentMapsEveryField(t *testing.T) {
	src := SourceRecord{
		NuAnoCenso: intPtr(2024),
		IESCoIES:   intPtr(1),
		IESNoIES:   "UNIVERSIDADE FEDERAL DE MATO GROSSO",
		IESSgIES:   "UFMT",

		IESCoMantenedora: intPtr(1),
		IESNoMantenedora: "FUNDACAO UNIVERSIDADE FEDERAL DE MATO GROSSO",

		IESTpCategoriaAdministrativa: intPtr(1),
		IESNoCategoriaAdministrativa: "PÚBLICA FEDERAL",

		IESTpOrganizacaoAcademica: intPtr(1),
		IESNoOrganizacaoAcademica: "UNIVERSIDADE",

		IESCoRegiao:    intPtr(5),
		IESNoRegiao:    "CENTRO-OESTE",
		IESCoUF:        intPtr(51),
		IESNoUF:        "MATO GROSSO",
		IESSgUF:        "MT",
		IESCoMunicipio: intPtr(5103403),
		IESNoMunicipio: "CUIABÁ",
		IESInCapital:   intPtr(1),

		IESCoMesorregiao:  intPtr(4),
		IESNoMesorregiao:  "CENTRO-SUL MATO-GROSSENSE",
		IESCoMicrorregiao: intPtr(17),
		IESNoMicrorregiao: "CUIABÁ",

		IESTpRede:         intPtr(1),
		IESInComunitaria:  intPtr(0),
		IESInConfessional: intPtr(0),

		IESDsEndereco:            "Avenida Fernando Correa da Costa",
		IESDsNumeroEndereco:      "2367",
		IESDsComplementoEndereco: "Cidade Universitária",
		IESNoBairro:              "Boa Esperança",
		IESNuCEP:                 "78060900",

		IESQtDocTotal:  intPtr(1791),
		IESQtDocExe:    intPtr(1791),
		IESQtCursos:    intPtr(102),
		IESDocPorCurso: floatPtr(17.559),

		IESQtDocExSemGrad:       intPtr(0),
		IESMediaSemGradPorCurso: floatPtr(0.0),
		IESPercSemGrad:          floatPtr(0.0),
		IESQtDocExGrad:          intPtr(62),
		IESMediaGradPorCurso:    floatPtr(0.608),
		IESPercGrad:             floatPtr(3.462),
		IESQtDocExEsp:           intPtr(69),
		IESMediaEspPorCurso:     floatPtr(0.676),
		IESPercEsp:              floatPtr(3.853),
		IESQtDocExMest:          intPtr(242),
		IESMediaMestPorCurso:    floatPtr(2.373),
		IESPercMestres:          floatPtr(13.512),
		IESQtDocExDout:          intPtr(1418),
		IESMediaDoutPorCurso:    floatPtr(13.902),
		IESPercDoutores:         floatPtr(79.174),

		IESQtVg:             intPtr(24502),
		IESQtIng:            intPtr(5095),
		IESQtMat:            intPtr(15397),
		IESMediaIngPorCurso: floatPtr(49.951),
		IESMediaMatPorCurso: floatPtr(150.951),
		IESMediaVgPorCurso:  floatPtr(240.216),

		DtCarga: "2026-08-27",
	}

	want := ies.IES{
		NuAnoCenso: intPtr(2024),
		DtCarga:    "2026-08-27",
		CoIES:      "1",
		NoIES:      "Universidade Federal de Mato Grosso",
		SgIES:      "UFMT",
		Mantenedora: ies.Mantenedora{
			CoMantenedora: "1",
			NoMantenedora: "Fundacao Universidade Federal de Mato Grosso",
		},
		CategoriaAdministrativa: ies.CategoriaAdministrativa{
			TpCategoriaAdministrativa: "1",
			NoCategoriaAdministrativa: "Pública Federal",
		},
		OrganizacaoAcademica: ies.OrganizacaoAcademica{
			TpOrganizacaoAcademica: "1",
			NoOrganizacaoAcademica: "Universidade",
		},
		Rede: ies.Rede{
			TpRede:         "1",
			InComunitaria:  false,
			InConfessional: false,
		},
		Localizacao: ies.Localizacao{
			CoRegiao:       "5",
			NoRegiao:       "Centro-Oeste",
			CoUF:           "51",
			NoUF:           "Mato Grosso",
			SgUF:           "MT",
			CoMunicipio:    "5103403",
			NoMunicipio:    "Cuiabá",
			InCapital:      true,
			CoMesorregiao:  "4",
			NoMesorregiao:  "Centro-Sul Mato-Grossense",
			CoMicrorregiao: "17",
			NoMicrorregiao: "Cuiabá",
			Endereco: ies.Endereco{
				DsEndereco:            "Avenida Fernando Correa da Costa",
				DsNumeroEndereco:      "2367",
				DsComplementoEndereco: "Cidade Universitária",
				NoBairro:              "Boa Esperança",
				NuCEP:                 "78060900",
			},
		},
		Docentes: ies.Docentes{
			QtDocTotal:           intPtr(1791),
			QtDocExe:             intPtr(1791),
			QtCursos:             intPtr(102),
			DocPorCurso:          floatPtr(17.559),
			QtDocExSemGrad:       intPtr(0),
			MediaSemGradPorCurso: floatPtr(0.0),
			PercSemGrad:          floatPtr(0.0),
			QtDocExGrad:          intPtr(62),
			MediaGradPorCurso:    floatPtr(0.608),
			PercGrad:             floatPtr(3.462),
			QtDocExEsp:           intPtr(69),
			MediaEspPorCurso:     floatPtr(0.676),
			PercEsp:              floatPtr(3.853),
			QtDocExMest:          intPtr(242),
			MediaMestPorCurso:    floatPtr(2.373),
			PercMestres:          floatPtr(13.512),
			QtDocExDout:          intPtr(1418),
			MediaDoutPorCurso:    floatPtr(13.902),
			PercDoutores:         floatPtr(79.174),
		},
		VagasMatriculas: ies.VagasMatriculas{
			QtVg:             intPtr(24502),
			QtIng:            intPtr(5095),
			QtMat:            intPtr(15397),
			MediaIngPorCurso: floatPtr(49.951),
			MediaMatPorCurso: floatPtr(150.951),
			MediaVgPorCurso:  floatPtr(240.216),
		},
	}

	if got := ToDocument(src); !reflect.DeepEqual(got, want) {
		t.Errorf("documento = %+v, esperado %+v", got, want)
	}
}

func TestToDocumentSemCoIESDeixaCoIESVazio(t *testing.T) {
	doc := ToDocument(SourceRecord{})
	if doc.CoIES != "" {
		t.Errorf("co_ies = %q, esperado vazio quando ies_co_ies é nil", doc.CoIES)
	}
}
