package middlewares

import (
	"log/slog"
	"net/http"

	"api_estudante/internal/httpx"
)

// Recover captura panics dos handlers e responde 500 em JSON.
func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				slog.Error("panic recuperado", "error", recovered, "method", r.Method, "path", r.URL.Path)
				httpx.WriteError(w, http.StatusInternalServerError, "Erro interno")
			}
		}()
		next.ServeHTTP(w, r)
	})
}
