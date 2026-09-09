package sugestoes

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

// Handler gerencia requisições de sugestões de cursos
type Handler struct {
	Service Service
}

// ServeHTTP implementa http.Handler
// GET /cursos/sugestoes?q={termo}&limit={limit}
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// 1. Validar método HTTP
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	// 2. Parse query params
	termo := r.URL.Query().Get("q")
	if termo == "" {
		http.Error(w, "Parâmetro 'q' é obrigatório", http.StatusBadRequest)
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	// 3. Criar contexto com timeout
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// 4. Chamar service
	sugestoes, err := h.Service.SugerirCursos(ctx, termo, limit)
	if err != nil {
		slog.Error("Erro ao buscar sugestões", "error", err, "termo", termo)
		http.Error(w, "Erro interno ao buscar sugestões", http.StatusInternalServerError)
		return
	}

	// 5. Retornar JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(SugestoesResponse{Results: sugestoes}); err != nil {
		slog.Error("Erro ao serializar JSON", "error", err)
	}
}
