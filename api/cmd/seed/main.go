package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"api_estudante/internal/config"
	"api_estudante/internal/ingest/seed"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))
	os.Exit(run())
}

func run() int {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg := config.Load()
	if err := cfg.ValidateSeed(); err != nil {
		slog.Error("configuração inválida", "error", err)
		return 1
	}
	if err := seed.Run(ctx, cfg); err != nil {
		slog.Error("ingestão falhou", "error", err)
		return 1
	}
	return 0
}
