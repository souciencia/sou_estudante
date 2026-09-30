package httpx

import "time"

// Parâmetros padrão da camada HTTP da API.
const (
	// Limites de paginação.
	DefaultPageSize = 20
	MaxPageSize     = 100

	// RequestTimeout é o prazo máximo por requisição à API.
	RequestTimeout = 5 * time.Second
)
