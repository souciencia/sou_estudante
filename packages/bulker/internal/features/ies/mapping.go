package ies

import _ "embed"

// Mapping é o mapping do índice de IES, embutido no binário.
//
//go:embed mapping.json
var Mapping []byte
