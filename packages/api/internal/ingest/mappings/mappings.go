// Package mappings centraliza os mappings dos índices populados pela ingestão.
// O //go:embed exige os arquivos no mesmo diretório, então mantê-los juntos
// evita repetir o mesmo stub de embed em cada feature.
package mappings

import _ "embed"

// Cursos é o mapping do índice de cursos.
//
//go:embed cursos.json
var Cursos []byte

// IES é o mapping do índice de IES.
//
//go:embed ies.json
var IES []byte

// CursosDictionary é o mapping do índice de dicionário de cursos.
//
//go:embed cursos_dictionary.json
var CursosDictionary []byte

// IESDictionary é o mapping do índice de dicionário de IES.
//
//go:embed ies_dictionary.json
var IESDictionary []byte
