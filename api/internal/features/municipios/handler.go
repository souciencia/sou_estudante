package municipios

import (
	"context"
	"log/slog"
	"net/http"

	"api_estudante/internal/httpx"
)

// Handler gerencia a listagem de municípios por UF.
type Handler struct {
	Service Service
}

// ServeHTTP implementa http.Handler para GET /municipios.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), httpx.RequestTimeout)
	defer cancel()

	municipios, err := h.Service.ListarMunicipios(ctx)
	if err != nil {
		slog.Error("Erro ao listar municípios", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "Erro interno ao listar municípios")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, municipios)
}
