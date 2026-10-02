package ies

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"api_estudante/internal/apperr"
	"api_estudante/internal/httpx"
)

// Handler gerencia a listagem/busca de IES.
type Handler struct {
	Service Service
}

// ServeHTTP implementa http.Handler para GET /ies.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Query()
	query := strings.TrimSpace(params.Get("q"))
	if query == "" {
		httpx.WriteError(w, http.StatusBadRequest, "Parâmetro 'q' é obrigatório")
		return
	}

	page, _ := strconv.Atoi(params.Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(params.Get("limit"))
	if limit < 1 || limit > maxPageSize {
		limit = defaultPageSize
	}

	filters := SearchFilterParams{
		UF:          httpx.SplitCSV(params["uf"]),
		Regiao:      httpx.SplitCSV(params["regiao"]),
		Categoria:   httpx.SplitCSV(params["categoria"]),
		Organizacao: httpx.SplitCSV(params["organizacao"]),
		Sort:        params.Get("sort"),
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpx.RequestTimeout)
	defer cancel()

	response, err := h.Service.BuscarIES(ctx, query, filters, page, limit)
	if errors.Is(err, apperr.ErrInvalidInput) {
		httpx.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err != nil {
		slog.Error("Erro ao buscar ies", "error", err, "query", query)
		httpx.WriteError(w, http.StatusInternalServerError, "Erro interno ao buscar ies")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, response)
}

// DetailHandler gerencia a busca de uma IES específica.
type DetailHandler struct {
	Service Service
}

// ServeHTTP implementa http.Handler para GET /ies/{co_ies}.
func (h *DetailHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	coIES := r.PathValue("co_ies")
	if coIES == "" {
		httpx.WriteError(w, http.StatusBadRequest, "Parâmetro 'co_ies' é obrigatório")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpx.RequestTimeout)
	defer cancel()

	item, err := h.Service.BuscarIESPorID(ctx, coIES)
	if errors.Is(err, apperr.ErrInvalidInput) {
		httpx.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	if errors.Is(err, ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "IES não encontrada")
		return
	}
	if err != nil {
		slog.Error("Erro ao buscar ies por id", "error", err, "co_ies", coIES)
		httpx.WriteError(w, http.StatusInternalServerError, "Erro interno ao buscar ies")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, item)
}
