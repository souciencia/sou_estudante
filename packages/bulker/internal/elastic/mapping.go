package elastic

import _ "embed"

// CursosMapping é o mapping do índice principal, embutido no binário.
//
//go:embed mapping.json
var CursosMapping []byte
