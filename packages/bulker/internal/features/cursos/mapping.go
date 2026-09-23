package cursos

import _ "embed"

// Mapping é o mapping do índice de cursos, embutido no binário.
//
//go:embed mapping.json
var Mapping []byte
