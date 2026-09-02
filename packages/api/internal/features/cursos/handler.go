package cursos

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

// Handler gerencia requisições de busca de cursos
type Handler struct {
	Service Service
}

// ServeHTTP implementa http.Handler
// GET /cursos?q={termo}&page={page}&limit={limit}
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// 1. Validar método HTTP
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	// 2. Parse query params
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Parâmetro 'q' é obrigatório", http.StatusBadRequest)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// 3. Criar contexto com timeout
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// 4. Chamar service
	response, err := h.Service.BuscarCursos(ctx, query, page, limit)
	if err != nil {
		slog.Error("Erro ao buscar cursos", "error", err, "query", query)
		http.Error(w, "Erro interno ao buscar cursos", http.StatusInternalServerError)
		return
	}

	// 5. Retornar JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		slog.Error("Erro ao serializar JSON", "error", err)
	}
}
