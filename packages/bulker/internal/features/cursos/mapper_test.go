package cursos

import "testing"

func intPtr(value int) *int {
	return &value
}

func int64Ptr(value int64) *int64 {
	return &value
}

func TestToDocumentConvertsFlattenedRecordIntoIndexedDocument(t *testing.T) {
	src := SourceRecord{
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
		SisuOfertas: []OfertaSource{
			{Municipio: intPtr(5103403), NomeMunicipio: "CUIABÁ", Vagas: intPtr(10)},
		},
	}

	doc := ToDocument(src, InstituicaoInfo{})

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

func TestToDocumentEnrichesInstituicaoWithIESData(t *testing.T) {
	src := SourceRecord{IESCoIES: intPtr(376)}
	info := InstituicaoInfo{
		NoIES:                   "UNIVERSIDADE DA AMAZÔNIA",
		SgIES:                   "UNAMA",
		CategoriaAdministrativa: "Privada com fins lucrativos",
		OrganizacaoAcademica:    "Universidade",
	}

	doc := ToDocument(src, info)

	if doc.Instituicao.CoIES != "376" {
		t.Errorf("instituicao.co_ies = %q, esperado %q", doc.Instituicao.CoIES, "376")
	}
	if doc.Instituicao.NoIES != info.NoIES {
		t.Errorf("instituicao.no_ies = %q, esperado %q", doc.Instituicao.NoIES, info.NoIES)
	}
	if doc.Instituicao.SgIES != info.SgIES {
		t.Errorf("instituicao.sg_ies = %q, esperado %q", doc.Instituicao.SgIES, info.SgIES)
	}
	if doc.Instituicao.CategoriaAdministrativa != info.CategoriaAdministrativa {
		t.Errorf("instituicao.categoria_administrativa = %q, esperado %q", doc.Instituicao.CategoriaAdministrativa, info.CategoriaAdministrativa)
	}
	if doc.Instituicao.OrganizacaoAcademica != info.OrganizacaoAcademica {
		t.Errorf("instituicao.organizacao_academica = %q, esperado %q", doc.Instituicao.OrganizacaoAcademica, info.OrganizacaoAcademica)
	}
}
