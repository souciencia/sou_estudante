package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	es "github.com/elastic/go-elasticsearch/v8"

	"api_estudante/internal/config"
	"api_estudante/internal/elasticsearch"
	"api_estudante/internal/features/cursos"
	"api_estudante/internal/features/ies"
	"api_estudante/internal/features/sugestoes"
	"api_estudante/internal/httpx"
	"api_estudante/internal/middlewares"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	cfg := config.Load()
	esClient, err := elasticsearch.NewClient(cfg.ESURL, cfg.ESAPIKey)
	if err != nil {
		slog.Error("Falha ao conectar no Elasticsearch", "error", err)
		os.Exit(1)
	}

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      newRouter(esClient, cfg),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Graceful Shutdown (Estratégia recomendada para produção)
	go func() {
		slog.Info("Servidor iniciado", "porta", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Erro fatal no servidor", "error", err)
			os.Exit(1)
		}
	}()

	// Canal para ouvir sinais do SO (Ctrl+C, kill)
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	slog.Info("Desligando o servidor...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		slog.Error("Erro ao desligar servidor", "error", err)
	}
	slog.Info("Servidor encerrado com sucesso.")
}

// newRouter monta o roteador HTTP somente leitura da API.
func newRouter(esClient *es.Client, cfg *config.Config) http.Handler {
	mux := http.NewServeMux()

	cursoRepo := cursos.NewElasticsearchRepository(esClient)
	cursoService := cursos.NewService(cursoRepo)
	mux.Handle("GET /cursos", &cursos.Handler{Service: cursoService})
	mux.Handle("GET /cursos/{id}", &cursos.DetailHandler{Service: cursoService})

	sugestaoRepo := sugestoes.NewElasticsearchRepository(esClient, cfg.DictIndexName, "no_curso")
	mux.Handle("GET /cursos/sugestoes", &sugestoes.Handler{Service: sugestoes.NewService(sugestaoRepo)})

	iesRepo := ies.NewElasticsearchRepository(esClient)
	iesService := ies.NewService(iesRepo)
	mux.Handle("GET /ies", &ies.Handler{Service: iesService})
	mux.Handle("GET /ies/{co_ies}", &ies.DetailHandler{Service: iesService})

	iesSugestaoRepo := sugestoes.NewElasticsearchRepository(esClient, cfg.IESDictIndexName, "no_ies")
	mux.Handle("GET /ies/sugestoes", &sugestoes.Handler{Service: sugestoes.NewService(iesSugestaoRepo)})

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	handler := middlewares.Recover(mux)
	handler = middlewares.AccessLog(handler)
	handler = middlewares.RequestID(handler)
	return middlewares.CorsMiddleware(handler)
}
