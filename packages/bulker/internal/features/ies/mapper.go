package ies

// ToDocument converte um registro de origem no documento indexado.
func ToDocument(src SourceRecord) Document {
	return Document{
		CoIES:                   src.CoIES,
		NoIES:                   src.NoIES,
		SgIES:                   src.SgIES,
		CategoriaAdministrativa: src.CategoriaAdministrativa,
		OrganizacaoAcademica:    src.OrganizacaoAcademica,
		Municipio:               src.Municipio,
		UF:                      src.UF,
		Regiao:                  src.Regiao,
	}
}
