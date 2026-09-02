package cursos

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Handler gerencia requisições de busca de cursos
type Handler struct {
	Service Service
}

// parseSliceParam divide valores separados por vírgula e múltiplos parâmetros em slice de strings
func parseSliceParam(values []string) []string {
	var result []string
	for _, v := range values {
		for _, part := range strings.Split(v, ",") {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				result = append(result, trimmed)
			}
		}
	}
	return result
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
		UF:         parseSliceParam(r.URL.Query()["uf"]),
		Turno:      parseSliceParam(r.URL.Query()["turno"]),
		Grau:       parseSliceParam(r.URL.Query()["grau"]),
		Categoria:  parseSliceParam(r.URL.Query()["categoria"]),
		Modalidade: parseSliceParam(r.URL.Query()["modalidade"]),
		Enade:      parseSliceParam(r.URL.Query()["enade"]),
		Sort:       r.URL.Query().Get("sort"),
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
