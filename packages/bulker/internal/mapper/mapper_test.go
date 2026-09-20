package mapper

import (
	"testing"

	"bulker/internal/model"
)

func intPtr(value int) *int {
	return &value
}

func int64Ptr(value int64) *int64 {
	return &value
}

func TestToDocumentConvertsFlattenedRecordIntoIndexedDocument(t *testing.T) {
	src := model.SourceRecord{
		Sequencial:      int64Ptr(10),
		NuAnoCenso:      intPtr(2024),
		IESCoIES:        intPtr(42),
		CursoCoCurso:    intPtr(7),
		CursoNoCurso:    "DIREITO",
		CursoInGratuito: intPtr(1),
		CursoInCapital:  intPtr(0),
		CursoCoUF:       intPtr(51),
		CursoNoUF:       "MATO GROSSO",
		CursoSgUF:       "MT",
		SisuTemSisu:     intPtr(1),
		SisuOfertas:     []model.OfertaSource{
			{Municipio: intPtr(5103403), NomeMunicipio: "CUIABÁ", Vagas: intPtr(10)},
		},
	}

	doc := ToDocument(src)

	if doc.Edicao != "2024" {
		t.Errorf("edicao = %q, esperado %q", doc.Edicao, "2024")
	}
	if doc.Instituicao.CoIES != "42" {
		t.Errorf("instituicao.co_ies = %q, esperado %q", doc.Instituicao.CoIES, "42")
	}
	if doc.Curso.CoCurso != "7" {
		t.Errorf("curso.co_curso = %q, esperado %q", doc.Curso.CoCurso, "7")
	}
	if !doc.Curso.InGratuito {
		t.Error("curso.in_gratuito deveria ser true para o valor 1")
	}
	if doc.Localizacao.InCapital {
		t.Error("localizacao.in_capital deveria ser false para o valor 0")
	}
	if doc.Localizacao.CoMunicipio != "" {
		t.Errorf("localizacao.co_municipio = %q, esperado vazio", doc.Localizacao.CoMunicipio)
	}
	if !doc.Sisu.TemSisu {
		t.Error("sisu.tem_sisu deveria ser true para o valor 1")
	}
	if len(doc.Sisu.Ofertas) != 1 || doc.Sisu.Ofertas[0].Municipio != "5103403" {
		t.Errorf("sisu.ofertas mapeadas incorretamente: %+v", doc.Sisu.Ofertas)
	}
}
