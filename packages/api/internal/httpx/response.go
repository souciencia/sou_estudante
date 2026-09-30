// Package httpx reúne helpers da borda HTTP da API: respostas JSON, paginação
// e parsing de parâmetros de consulta.
package httpx

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

// errorResponse é o corpo padrão de erro da API.
type errorResponse struct {
	Error string `json:"error"`
}

// WriteJSON serializa payload como JSON com o status informado.
func WriteJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		slog.Error("Erro ao serializar JSON", "error", err)
	}
}

// WriteError serializa uma resposta de erro como JSON com o status informado.
func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, errorResponse{Error: message})
}
