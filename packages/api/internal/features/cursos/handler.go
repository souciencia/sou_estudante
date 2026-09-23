package cursos

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"api_estudante/internal/shared"
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

	filters := SearchFilterParams{
		UF:         shared.SplitCSV(r.URL.Query()["uf"]),
		Turno:      shared.SplitCSV(r.URL.Query()["turno"]),
		Grau:       shared.SplitCSV(r.URL.Query()["grau"]),
		Categoria:  shared.SplitCSV(r.URL.Query()["categoria"]),
		Modalidade: shared.SplitCSV(r.URL.Query()["modalidade"]),
		Enade:      shared.SplitCSV(r.URL.Query()["enade"]),
		Sort:       r.URL.Query().Get("sort"),
		Exact:      parseExactParam(r.URL.Query().Get("exact")),
	}

	// 3. Criar contexto com timeout
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// 4. Chamar service
	response, err := h.Service.BuscarCursos(ctx, query, filters, page, limit)
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
