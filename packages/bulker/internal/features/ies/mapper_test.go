package ies

import "testing"

func TestToDocumentMapsEveryField(t *testing.T) {
	src := SourceRecord{
		CoIES:                   "376",
		NoIES:                   "CENTRO UNIVERSITÁRIO ANHANGUERA DE SÃO PAULO",
		SgIES:                   "Anhanguera SP",
		CategoriaAdministrativa: "Privada com fins lucrativos",
		OrganizacaoAcademica:    "Centro Universitário",
		Municipio:               "São Paulo",
		UF:                      "SP",
		Regiao:                  "Sudeste",
	}

	doc := ToDocument(src)

	if doc.CoIES != src.CoIES {
		t.Errorf("co_ies = %q, esperado %q", doc.CoIES, src.CoIES)
	}
	if doc.NoIES != src.NoIES {
		t.Errorf("no_ies = %q, esperado %q", doc.NoIES, src.NoIES)
	}
	if doc.SgIES != src.SgIES {
		t.Errorf("sg_ies = %q, esperado %q", doc.SgIES, src.SgIES)
	}
	if doc.CategoriaAdministrativa != src.CategoriaAdministrativa {
		t.Errorf("categoria_administrativa = %q, esperado %q", doc.CategoriaAdministrativa, src.CategoriaAdministrativa)
	}
	if doc.OrganizacaoAcademica != src.OrganizacaoAcademica {
		t.Errorf("organizacao_academica = %q, esperado %q", doc.OrganizacaoAcademica, src.OrganizacaoAcademica)
	}
	if doc.Municipio != src.Municipio {
		t.Errorf("municipio = %q, esperado %q", doc.Municipio, src.Municipio)
	}
	if doc.UF != src.UF {
		t.Errorf("uf = %q, esperado %q", doc.UF, src.UF)
	}
	if doc.Regiao != src.Regiao {
		t.Errorf("regiao = %q, esperado %q", doc.Regiao, src.Regiao)
	}
}
