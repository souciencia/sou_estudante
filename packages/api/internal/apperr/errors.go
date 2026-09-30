// Package apperr reúne erros de aplicação neutros de camada, reaproveitados
// pelos diferentes módulos da API.
package apperr

import "errors"

// ErrInvalidInput indica parâmetro de entrada ausente ou inválido. Handlers
// devem mapeá-lo para HTTP 400.
var ErrInvalidInput = errors.New("entrada inválida")
