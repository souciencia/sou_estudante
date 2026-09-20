package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"bulker/internal/bulker"
	"bulker/internal/config"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))
	os.Exit(run())
}

func run() int {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := bulker.Run(ctx, config.Load()); err != nil {
		slog.Error("bulking falhou", "error", err)
		return 1
	}
	return 0
}
