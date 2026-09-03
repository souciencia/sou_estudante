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
