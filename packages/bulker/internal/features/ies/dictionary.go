package ies

import _ "embed"

// DictionarySourceField é o campo termo extraído do índice de IES.
const DictionarySourceField = "no_ies.keyword"

// DictionaryDocField é o nome do campo no documento do dicionário de IES.
const DictionaryDocField = "no_ies"

// DictionaryMapping é o mapping do índice de dicionário de IES.
//
//go:embed dictionary_mapping.json
var DictionaryMapping []byte
