package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"api_estudante/internal/config"
	"api_estudante/internal/database"
	"api_estudante/internal/features/cursos"
	"api_estudante/internal/features/ies"
	"api_estudante/internal/features/sugestoes"
	"api_estudante/internal/middlewares"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	cfg := config.Load()
	esClient, err := database.NewElasticsearchClient(cfg)
	if err != nil {
		slog.Error("Falha ao conectar no Elasticsearch", "error", err)
		os.Exit(1)
	}

	mux := http.NewServeMux()

	cursoRepo := cursos.NewElasticsearchRepository(esClient)
	cursoService := cursos.NewService(cursoRepo)
	cursoHandler := &cursos.Handler{Service: cursoService}

	mux.Handle("/cursos", cursoHandler)

	sugestaoRepo := sugestoes.NewElasticsearchRepository(esClient, cfg.ESDictIndexName, "no_curso")
	sugestaoService := sugestoes.NewService(sugestaoRepo)
	sugestaoHandler := &sugestoes.Handler{Service: sugestaoService}

	mux.Handle("/cursos/sugestoes", sugestaoHandler)

	iesRepo := ies.NewElasticsearchRepository(esClient)
	iesService := ies.NewService(iesRepo)
	iesHandler := &ies.Handler{Service: iesService}
	iesDetailHandler := &ies.DetailHandler{Service: iesService}

	iesSugestaoRepo := sugestoes.NewElasticsearchRepository(esClient, cfg.IESDictIndexName, "no_ies")
	iesSugestaoService := sugestoes.NewService(iesSugestaoRepo)
	iesSugestaoHandler := &sugestoes.Handler{Service: iesSugestaoService}

	mux.Handle("GET /ies", iesHandler)
	mux.Handle("GET /ies/sugestoes", iesSugestaoHandler)
	mux.Handle("GET /ies/{co_ies}", iesDetailHandler)

	// Cadeia de Middlewares
	// Você pode encadear mais middlewares aqui (Logging, Auth, etc)
	finalHandler := middlewares.CorsMiddleware(mux)

	// Configuração do Servidor
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      finalHandler,
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
