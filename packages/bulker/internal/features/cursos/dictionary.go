package cursos

import _ "embed"

// DictionarySourceField é o campo termo extraído do índice de cursos.
const DictionarySourceField = "curso.no_curso.keyword"

// DictionaryDocField é o nome do campo no documento do dicionário de cursos.
const DictionaryDocField = "no_curso"

// DictionaryMapping é o mapping do índice de dicionário de cursos.
//
//go:embed dictionary_mapping.json
var DictionaryMapping []byte
