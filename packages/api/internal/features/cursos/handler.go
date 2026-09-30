package cursos

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

// Handler gerencia requisições de busca de cursos
type Handler struct {
	Service Service
}

// parseExactParam interpreta o parâmetro "exact". Ausente ou inválido = true.
func parseExactParam(raw string) bool {
	if raw == "" {
		return true
	}
	parsed, err := strconv.ParseBool(raw)
	if err != nil {
		return true
	}
	return parsed
}

// ServeHTTP implementa http.Handler
// GET /cursos?q={termo}&page={page}&limit={limit}&uf={uf}&turno={turno}&grau={grau}&categoria={categoria}&modalidade={modalidade}&enade={enade}&sort={sort}
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("q"))
	if query == "" {
		httpx.WriteError(w, http.StatusBadRequest, "Parâmetro 'q' é obrigatório")
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > httpx.MaxPageSize {
		limit = httpx.DefaultPageSize
	}

	filters := SearchFilterParams{
		UF:         httpx.SplitCSV(r.URL.Query()["uf"]),
		Turno:      httpx.SplitCSV(r.URL.Query()["turno"]),
		Grau:       httpx.SplitCSV(r.URL.Query()["grau"]),
		Categoria:  httpx.SplitCSV(r.URL.Query()["categoria"]),
		Modalidade: httpx.SplitCSV(r.URL.Query()["modalidade"]),
		Enade:      httpx.SplitCSV(r.URL.Query()["enade"]),
		Sort:       r.URL.Query().Get("sort"),
		Exact:      parseExactParam(r.URL.Query().Get("exact")),
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpx.RequestTimeout)
	defer cancel()

	response, err := h.Service.BuscarCursos(ctx, query, filters, page, limit)
	if errors.Is(err, apperr.ErrInvalidInput) {
		httpx.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err != nil {
		slog.Error("Erro ao buscar cursos", "error", err, "query", query)
		httpx.WriteError(w, http.StatusInternalServerError, "Erro interno ao buscar cursos")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, response)
}

// DetailHandler gerencia a busca de um curso específico.
type DetailHandler struct {
	Service Service
}

// ServeHTTP implementa http.Handler para GET /cursos/{id}.
func (h *DetailHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		httpx.WriteError(w, http.StatusBadRequest, "Parâmetro 'id' é obrigatório")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), httpx.RequestTimeout)
	defer cancel()

	item, err := h.Service.BuscarCursoPorID(ctx, id)
	if errors.Is(err, apperr.ErrInvalidInput) {
		httpx.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	if errors.Is(err, ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "Curso não encontrado")
		return
	}
	if err != nil {
		slog.Error("Erro ao buscar curso por id", "error", err, "id", id)
		httpx.WriteError(w, http.StatusInternalServerError, "Erro interno ao buscar curso")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, item)
}
