package ingest

import (
	"reflect"
	"testing"

	"api_estudante/internal/features/ies"
)

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

	want := ies.IES{
		CoIES:                   "376",
		NoIES:                   "CENTRO UNIVERSITÁRIO ANHANGUERA DE SÃO PAULO",
		SgIES:                   "Anhanguera SP",
		CategoriaAdministrativa: "Privada com fins lucrativos",
		OrganizacaoAcademica:    "Centro Universitário",
		Municipio:               "São Paulo",
		UF:                      "SP",
		Regiao:                  "Sudeste",
	}

	if got := ToDocument(src); !reflect.DeepEqual(got, want) {
		t.Errorf("documento = %+v, esperado %+v", got, want)
	}
}
