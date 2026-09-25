package ies

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"api_estudante/internal/shared"
)

// Handler gerencia a listagem/busca de IES.
type Handler struct {
	Service Service
}

// ServeHTTP implementa http.Handler para GET /ies.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	params := r.URL.Query()
	query := params.Get("q")

	page, _ := strconv.Atoi(params.Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(params.Get("limit"))
	if limit < 1 || limit > maxPageSize {
		limit = defaultPageSize
	}

	filters := SearchFilterParams{
		UF:          shared.SplitCSV(params["uf"]),
		Regiao:      shared.SplitCSV(params["regiao"]),
		Categoria:   shared.SplitCSV(params["categoria"]),
		Organizacao: shared.SplitCSV(params["organizacao"]),
		Sort:        params.Get("sort"),
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	response, err := h.Service.BuscarIES(ctx, query, filters, page, limit)
	if err != nil {
		slog.Error("Erro ao buscar ies", "error", err, "query", query)
		http.Error(w, "Erro interno ao buscar ies", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, response)
}

// DetailHandler gerencia a busca de uma IES específica.
type DetailHandler struct {
	Service Service
}

// ServeHTTP implementa http.Handler para GET /ies/{co_ies}.
func (h *DetailHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	coIES := r.PathValue("co_ies")
	if coIES == "" {
		http.Error(w, "Parâmetro 'co_ies' é obrigatório", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	item, err := h.Service.BuscarIESPorID(ctx, coIES)
	if errors.Is(err, ErrNotFound) {
		http.Error(w, "IES não encontrada", http.StatusNotFound)
		return
	}
	if err != nil {
		slog.Error("Erro ao buscar ies por id", "error", err, "co_ies", coIES)
		http.Error(w, "Erro interno ao buscar ies", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, item)
}

// writeJSON serializa payload como JSON com o status informado.
func writeJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		slog.Error("Erro ao serializar JSON", "error", err)
	}
}
