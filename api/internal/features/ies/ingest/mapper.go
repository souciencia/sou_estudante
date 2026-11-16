package ingest

import (
	"api_estudante/internal/features/ies"
	"api_estudante/internal/textcase"
)

// ToDocument converte um registro de origem no documento indexado.
func ToDocument(src SourceRecord) ies.IES {
	return ies.IES{
		NuAnoCenso: src.NuAnoCenso,
		DtCarga:    src.DtCarga,
		CoIES:      intToStr(src.IESCoIES),
		NoIES:      textcase.Title(src.IESNoIES),
		SgIES:      src.IESSgIES,

		Mantenedora: ies.Mantenedora{
			CoMantenedora: intToStr(src.IESCoMantenedora),
			NoMantenedora: textcase.Title(src.IESNoMantenedora),
		},

		CategoriaAdministrativa: ies.CategoriaAdministrativa{
			TpCategoriaAdministrativa: intToStr(src.IESTpCategoriaAdministrativa),
			NoCategoriaAdministrativa: textcase.Title(src.IESNoCategoriaAdministrativa),
		},

		OrganizacaoAcademica: ies.OrganizacaoAcademica{
			TpOrganizacaoAcademica: intToStr(src.IESTpOrganizacaoAcademica),
			NoOrganizacaoAcademica: textcase.Title(src.IESNoOrganizacaoAcademica),
		},

		Rede: ies.Rede{
			TpRede:         intToStr(src.IESTpRede),
			InComunitaria:  intToBool(src.IESInComunitaria),
			InConfessional: intToBool(src.IESInConfessional),
		},

		Localizacao: ies.Localizacao{
			CoRegiao:       intToStr(src.IESCoRegiao),
			NoRegiao:       textcase.Title(src.IESNoRegiao),
			CoUF:           intToStr(src.IESCoUF),
			NoUF:           textcase.Title(src.IESNoUF),
			SgUF:           src.IESSgUF,
			CoMunicipio:    intToStr(src.IESCoMunicipio),
			NoMunicipio:    textcase.Title(src.IESNoMunicipio),
			InCapital:      intToBool(src.IESInCapital),
			CoMesorregiao:  intToStr(src.IESCoMesorregiao),
			NoMesorregiao:  textcase.Title(src.IESNoMesorregiao),
			CoMicrorregiao: intToStr(src.IESCoMicrorregiao),
			NoMicrorregiao: textcase.Title(src.IESNoMicrorregiao),
			Endereco: ies.Endereco{
				DsEndereco:            src.IESDsEndereco,
				DsNumeroEndereco:      src.IESDsNumeroEndereco,
				DsComplementoEndereco: src.IESDsComplementoEndereco,
				NoBairro:              textcase.Title(src.IESNoBairro),
				NuCEP:                 src.IESNuCEP,
			},
		},

		Docentes: ies.Docentes{
			QtDocTotal:           src.IESQtDocTotal,
			QtDocExe:             src.IESQtDocExe,
			QtCursos:             src.IESQtCursos,
			DocPorCurso:          src.IESDocPorCurso,
			QtDocExSemGrad:       src.IESQtDocExSemGrad,
			MediaSemGradPorCurso: src.IESMediaSemGradPorCurso,
			PercSemGrad:          src.IESPercSemGrad,
			QtDocExGrad:          src.IESQtDocExGrad,
			MediaGradPorCurso:    src.IESMediaGradPorCurso,
			PercGrad:             src.IESPercGrad,
			QtDocExEsp:           src.IESQtDocExEsp,
			MediaEspPorCurso:     src.IESMediaEspPorCurso,
			PercEsp:              src.IESPercEsp,
			QtDocExMest:          src.IESQtDocExMest,
			MediaMestPorCurso:    src.IESMediaMestPorCurso,
			PercMestres:          src.IESPercMestres,
			QtDocExDout:          src.IESQtDocExDout,
			MediaDoutPorCurso:    src.IESMediaDoutPorCurso,
			PercDoutores:         src.IESPercDoutores,
		},

		VagasMatriculas: ies.VagasMatriculas{
			QtVg:             src.IESQtVg,
			QtIng:            src.IESQtIng,
			QtMat:            src.IESQtMat,
			MediaIngPorCurso: src.IESMediaIngPorCurso,
			MediaMatPorCurso: src.IESMediaMatPorCurso,
			MediaVgPorCurso:  src.IESMediaVgPorCurso,
		},
	}
}
