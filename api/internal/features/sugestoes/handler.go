package sugestoes

import (
	"context"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"api_estudante/internal/httpx"
)

// Handler gerencia requisições de sugestões de cursos
type Handler struct {
	Service Service
}

// ServeHTTP implementa http.Handler
// GET /cursos/sugestoes?q={termo}&limit={limit}
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	termo := strings.TrimSpace(r.URL.Query().Get("q"))
	if termo == "" {
		httpx.WriteError(w, http.StatusBadRequest, "Parâmetro 'q' é obrigatório")
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	ctx, cancel := context.WithTimeout(r.Context(), httpx.RequestTimeout)
	defer cancel()

	sugestoes, err := h.Service.Sugerir(ctx, termo, limit)
	if err != nil {
		slog.Error("Erro ao buscar sugestões", "error", err, "termo", termo)
		httpx.WriteError(w, http.StatusInternalServerError, "Erro interno ao buscar sugestões")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, SugestoesResponse{Results: sugestoes})
}
